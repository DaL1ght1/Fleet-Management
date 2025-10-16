import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SelectionDialogComponent } from './dialogs/selection-dialog.component';

import { TripService, CreateTripInput, TripType, TripStatus } from '../../../../services/trip.service';
import { DriverService, Driver } from '../../../../services/driver.service';
import { VehicleService, Vehicle } from '../../../../core/services/vehicle.service';
import { MapService, LocationData, MapRoute, MapCoordinates } from '../../../../core/services/map.service';
import { InteractiveMapComponent } from '../../../../shared/components/interactive-map/interactive-map.component';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface LocationFormGroup {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDialogModule,
    InteractiveMapComponent
  ],
  templateUrl: './trip-create.component.html',
  styleUrls: ['./trip-create.component.scss']
})
export class TripCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private tripService = inject(TripService);
  private driverService = inject(DriverService);
  private vehicleService = inject(VehicleService);
  private mapService = inject(MapService);
  private dialog = inject(MatDialog);

  // Form state
  tripForm!: FormGroup;
  loading = signal(false);
  
  // Data for dropdowns
  drivers = signal<Driver[]>([]);
  vehicles = signal<Vehicle[]>([]);
  
  // Map-related signals
  currentRoute = signal<MapRoute | null>(null);
  routeLoading = signal(false);
  locationSuggestions = signal<LocationData[]>([]);
  locationSearchLoading = signal(false);
  currentUserLocation = signal<MapCoordinates | null>(null);
  
  // Search subjects for debouncing
  private locationSearchSubject = new Subject<{query: string, type: 'start' | 'end' | 'waypoint', index?: number}>();
  
  // Trip types and statuses
  tripTypes = Object.values(TripType);
  tripStatuses = Object.values(TripStatus);

  ngOnInit() {
    this.initializeForm();
    this.loadFormData();
    this.initializeMapFunctionality();
  }

  private initializeForm() {
    this.tripForm = this.fb.group({
      // Basic trip information
      vehicleId: ['', Validators.required],
      driverId: ['', Validators.required],
      type: [TripType.PASSENGER, Validators.required],
      status: [TripStatus.SCHEDULED, Validators.required],
      
      // Location information
      startLocation: this.fb.group({
        latitude: [null, Validators.required],
        longitude: [null, Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: [''],
        zipCode: ['']
      }),
      
      endLocation: this.fb.group({
        latitude: [null, Validators.required],
        longitude: [null, Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: [''],
        zipCode: ['']
      }),
      
      // Waypoints array
      waypoints: this.fb.array([]),
      
      // Timing
      startTime: [null],
      scheduledStartTime: [null, Validators.required],
      scheduledEndTime: [null],
      endTime: [null],
      
      // Distance and duration
      distance: [null, [Validators.min(0)]],
      duration: [null, [Validators.min(0)]],
      estimatedDuration: [null, [Validators.min(0)]],
      
      // Pricing
      baseRate: [null, [Validators.required, Validators.min(0)]],
      totalCost: [null, [Validators.min(0)]],
      fuelCost: [null, [Validators.min(0)]],
      additionalFees: [null, [Validators.min(0)]],
      
      // Notes
      notes: [''],
      customerNotes: [''],
      internalNotes: ['']
    });

    // Auto-calculate total cost when base rate or additional fees change
    const baseRateControl = this.tripForm.get('baseRate');
    const additionalFeesControl = this.tripForm.get('additionalFees');
    const fuelCostControl = this.tripForm.get('fuelCost');
    
    if (baseRateControl) {
      baseRateControl.valueChanges.subscribe(() => this.calculateTotalCost());
    }
    if (additionalFeesControl) {
      additionalFeesControl.valueChanges.subscribe(() => this.calculateTotalCost());
    }
    if (fuelCostControl) {
      fuelCostControl.valueChanges.subscribe(() => this.calculateTotalCost());
    }

    // Auto-calc scheduled end when start time or estimated duration changes
    const scheduledStart = this.tripForm.get('scheduledStartTime');
    const estimatedDuration = this.tripForm.get('estimatedDuration');
    scheduledStart?.valueChanges.subscribe(() => this.updateScheduledEnd());
    estimatedDuration?.valueChanges.subscribe(() => this.updateScheduledEnd());
    
    // Listen for location changes to calculate route
    this.tripForm.get('startLocation')?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged((prev, curr) => 
        JSON.stringify(prev) === JSON.stringify(curr)
      )
    ).subscribe(() => this.calculateRouteIfPossible());
    
    this.tripForm.get('endLocation')?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged((prev, curr) => 
        JSON.stringify(prev) === JSON.stringify(curr)
      )
    ).subscribe(() => this.calculateRouteIfPossible());
  }

  private async loadFormData() {
    try {
      // Load drivers
      this.driverService.getDriversForTrip().subscribe((drivers: any) => {
        this.drivers.set(drivers);
      });

      // Load vehicles first by loading all vehicles, then filter available ones
      await this.vehicleService.loadVehicles();
      this.vehicleService.getAvailableVehicles().subscribe((vehicles: any) => {
        this.vehicles.set(vehicles);
      });
    } catch (error) {
      // Handle error silently or show user notification
    }
  }

  // Waypoints management
  get waypointsArray(): FormArray {
    return this.tripForm.get('waypoints') as FormArray;
  }

  addWaypoint() {
    const waypointGroup = this.fb.group({
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: [''],
      zipCode: ['']
    });
    
    this.waypointsArray.push(waypointGroup);
    
    // Listen to waypoint changes and recalculate route
    waypointGroup.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(() => this.calculateRouteIfPossible());
  }

  removeWaypoint(index: number) {
    this.waypointsArray.removeAt(index);
    
    // Recalculate route after removing waypoint
    setTimeout(() => this.calculateRouteIfPossible(), 300);
  }
  
  // Optimize waypoints order for shortest route
  optimizeWaypoints() {
    const waypoints = this.getWaypointsFromForm();
    const startLocation = this.getLocationDataFromForm('start');
    const endLocation = this.getLocationDataFromForm('end');
    
    if (!startLocation || !endLocation || waypoints.length === 0) {
      console.log('Cannot optimize: missing start, end, or waypoints');
      return;
    }
    
    console.log('Optimizing waypoints...', { start: startLocation, end: endLocation, waypoints });
    
    // Simple nearest neighbor optimization
    const optimizedWaypoints = this.nearestNeighborOptimization(
      startLocation, endLocation, waypoints
    );
    
    console.log('Optimized waypoints:', optimizedWaypoints);
    
    // Update form with optimized waypoint order
    this.updateWaypointsInForm(optimizedWaypoints);
    
    // Recalculate route with new order
    setTimeout(() => this.calculateRouteIfPossible(), 500);
  }
  
  // Calculate route including waypoints
  private calculateRouteWithWaypoints() {
    const startLocation = this.getLocationDataFromForm('start');
    const endLocation = this.getLocationDataFromForm('end');
    const waypoints = this.getWaypointsFromForm();
    
    if (startLocation && endLocation) {
      if (waypoints.length === 0) {
        // Simple direct route
        this.calculateRoute(startLocation, endLocation);
      } else {
        // Route with waypoints - calculate total distance
        this.calculateMultiPointRoute(startLocation, endLocation, waypoints);
      }
    }
  }
  
  // Get waypoints data from form
  private getWaypointsFromForm(): LocationData[] {
    const waypoints: LocationData[] = [];
    const waypointsArray = this.waypointsArray;
    
    for (let i = 0; i < waypointsArray.length; i++) {
      const waypoint = waypointsArray.at(i)?.value;
      if (waypoint?.address && waypoint?.latitude && waypoint?.longitude) {
        waypoints.push({
          address: waypoint.address,
          coordinates: {
            lat: parseFloat(waypoint.latitude),
            lng: parseFloat(waypoint.longitude)
          },
          city: waypoint.city,
          formattedAddress: waypoint.address
        });
      }
    }
    
    return waypoints;
  }
  
  // Update waypoints in form with optimized order
  private updateWaypointsInForm(optimizedWaypoints: LocationData[]) {
    // Clear existing waypoints
    while (this.waypointsArray.length !== 0) {
      this.waypointsArray.removeAt(0);
    }
    
    // Add optimized waypoints
    optimizedWaypoints.forEach(waypoint => {
      const waypointGroup = this.fb.group({
        latitude: [waypoint.coordinates?.lat || null, Validators.required],
        longitude: [waypoint.coordinates?.lng || null, Validators.required],
        address: [waypoint.address || '', Validators.required],
        city: [waypoint.city || '', Validators.required],
        state: [waypoint.country || ''],
        zipCode: ['']
      });
      
      this.waypointsArray.push(waypointGroup);
    });
  }
  
  // Simple nearest neighbor optimization algorithm
  private nearestNeighborOptimization(
    start: LocationData, 
    end: LocationData, 
    waypoints: LocationData[]
  ): LocationData[] {
    if (waypoints.length === 0) return [];
    
    const optimized: LocationData[] = [];
    const remaining = [...waypoints];
    let current = start;
    
    while (remaining.length > 0) {
      let nearest = remaining[0];
      let nearestIndex = 0;
      let shortestDistance = this.calculateDistanceBetweenLocations(current, nearest);
      
      // Find nearest unvisited waypoint
      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistanceBetweenLocations(current, remaining[i]);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearest = remaining[i];
          nearestIndex = i;
        }
      }
      
      optimized.push(nearest);
      remaining.splice(nearestIndex, 1);
      current = nearest;
    }
    
    return optimized;
  }
  
  // Calculate route through multiple points
  private calculateMultiPointRoute(start: LocationData, end: LocationData, waypoints: LocationData[]) {
    this.routeLoading.set(true);
    
    // For multiple waypoints, calculate cumulative distance and time
    const points = [start, ...waypoints, end];
    let totalDistance = 0;
    let totalDuration = 0;
    
    // Calculate distance between consecutive points
    for (let i = 0; i < points.length - 1; i++) {
      const segmentDistance = this.calculateDistanceBetweenLocations(points[i], points[i + 1]);
      totalDistance += segmentDistance;
      totalDuration += this.estimateDuration(segmentDistance);
    }
    
    // Create route object
    const route: MapRoute = {
      startLocation: start,
      endLocation: end,
      distance: this.mapService.formatDistance(totalDistance),
      duration: this.mapService.formatDuration(totalDuration)
    };
    
    this.currentRoute.set(route);
    this.routeLoading.set(false);
    
    // Update form with calculated values
    this.tripForm.patchValue({
      distance: totalDistance,
      estimatedDuration: totalDuration
    });
    
    // Calculate fuel cost
    this.calculateFuelCost(totalDistance);
  }
  
  // Calculate distance between two locations
  private calculateDistanceBetweenLocations(loc1: LocationData, loc2: LocationData): number {
    if (!loc1.coordinates || !loc2.coordinates) {
      return 25; // Default estimate
    }
    
    return this.mapService.calculateDistance(loc1.coordinates, loc2.coordinates);
  }
  
  // Estimate duration in minutes based on distance
  private estimateDuration(distanceKm: number): number {
    // Estimate based on average speed of 50 km/h in city
    const averageSpeed = 50; // km/h
    const durationHours = distanceKm / averageSpeed;
    return Math.round(durationHours * 60); // Convert to minutes
  }

  // Cost calculation
  private calculateTotalCost() {
    const baseRateControl = this.tripForm.get('baseRate');
    const fuelCostControl = this.tripForm.get('fuelCost');
    const additionalFeesControl = this.tripForm.get('additionalFees');
    const totalCostControl = this.tripForm.get('totalCost');
    
    const baseRate = Number(baseRateControl?.value) || 0;
    const fuelCost = Number(fuelCostControl?.value) || 0;
    const additionalFees = Number(additionalFeesControl?.value) || 0;
    
    const totalCost = Math.round((baseRate + fuelCost + additionalFees) * 100) / 100;
    
    if (totalCostControl) {
      totalCostControl.setValue(totalCost, { emitEvent: false });
    }
  }

  // Auto compute scheduled end time from start + estimated duration (minutes)
  private updateScheduledEnd() {
    const start = this.tripForm.get('scheduledStartTime')?.value;
    const estMinutes: number = this.tripForm.get('estimatedDuration')?.value || 0;
    const endCtrl = this.tripForm.get('scheduledEndTime');
    
    console.log('updateScheduledEnd called:', { start, estMinutes, hasEndCtrl: !!endCtrl });
    
    if (start && estMinutes > 0 && endCtrl) {
      // Handle both Date objects and datetime-local string values
      let startDate: Date;
      if (typeof start === 'string') {
        startDate = new Date(start);
      } else if (start instanceof Date) {
        startDate = start;
      } else {
        console.log('Invalid start date format:', start);
        return;
      }
      
      // Validate startDate
      if (isNaN(startDate.getTime())) {
        console.log('Invalid start date:', startDate);
        return;
      }
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + estMinutes);
      
      // Format as datetime-local string (YYYY-MM-DDTHH:mm)
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      const hours = String(endDate.getHours()).padStart(2, '0');
      const minutes = String(endDate.getMinutes()).padStart(2, '0');
      const datetimeLocalString = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      console.log('Setting end time:', datetimeLocalString);
      endCtrl.setValue(datetimeLocalString, { emitEvent: false });
    }
  }

  // Initialize map functionality
  private initializeMapFunctionality() {
    // Set up location search debouncing
    this.locationSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.query === curr.query),
      filter(search => search.query.length > 2),
      switchMap(search => {
        this.locationSearchLoading.set(true);
        return this.mapService.geocodeAddress(search.query);
      })
    ).subscribe(result => {
      this.locationSearchLoading.set(false);
      if (result) {
        this.locationSuggestions.set([result]);
      }
    });
    
    // Get current user location
    this.getCurrentLocation();
  }
  
  // Get current user location
  private getCurrentLocation() {
    this.mapService.getCurrentLocation().subscribe(location => {
      if (location) {
        this.currentUserLocation.set(location);
      }
    });
  }
  
  // Use current location for start location
  useCurrentLocation() {
    const currentLocation = this.currentUserLocation();
    if (!currentLocation) {
      this.getCurrentLocation();
      return;
    }
    
    // Reverse geocode to get address details
    this.mapService.reverseGeocode(currentLocation).subscribe(locationData => {
      if (locationData) {
        const startLocationGroup = this.tripForm.get('startLocation');
        startLocationGroup?.patchValue({
          latitude: locationData.coordinates?.lat,
          longitude: locationData.coordinates?.lng,
          address: locationData.address,
          city: locationData.city,
          state: locationData.country // Tunisia doesn't have states, using country instead
        });
      }
    });
  }
  
  // Handle location input changes
  onLocationInputChange(value: string, locationType: 'start' | 'end' | 'waypoint', waypointIndex?: number) {
    if (value && value.length > 2) {
      this.locationSearchSubject.next({ query: value, type: locationType, index: waypointIndex });
    }
  }
  
  // Handle geocoding for address input
  onAddressBlur(locationType: 'start' | 'end' | 'waypoint', waypointIndex?: number) {
    const addressPath = locationType === 'start' ? 'startLocation.address' : 
                       locationType === 'end' ? 'endLocation.address' : 
                       `waypoints.${waypointIndex}.address`;
    
    const addressControl = this.tripForm.get(addressPath);
    const address = addressControl?.value;
    
    if (address && typeof address === 'string' && address.length > 3) {
      this.geocodeAndUpdateLocation(address, locationType, waypointIndex);
    }
  }
  
  // Geocode address and update form
  private geocodeAndUpdateLocation(address: string, locationType: 'start' | 'end' | 'waypoint', waypointIndex?: number) {
    this.mapService.geocodeAddress(address).subscribe(locationData => {
      if (locationData && locationData.coordinates) {
        const locationPath = locationType === 'start' ? 'startLocation' : 
                            locationType === 'end' ? 'endLocation' : 
                            `waypoints.${waypointIndex}`;
        
        const locationGroup = this.tripForm.get(locationPath);
        if (locationGroup) {
          locationGroup.patchValue({
            latitude: locationData.coordinates.lat,
            longitude: locationData.coordinates.lng,
            address: locationData.formattedAddress || address,
            city: locationData.city,
            state: locationData.country
          }, { emitEvent: true });
        }
      }
    });
  }
  
  // Calculate route when both start and end locations are available
  calculateRouteIfPossible() {
    const startLocation = this.getLocationDataFromForm('start');
    const endLocation = this.getLocationDataFromForm('end');
    
    if (startLocation && endLocation && startLocation.coordinates && endLocation.coordinates) {
      const waypoints = this.getWaypointsFromForm();
      
      if (waypoints.length > 0) {
        // Route with waypoints - calculate multi-point route
        this.calculateMultiPointRoute(startLocation, endLocation, waypoints);
      } else {
        // Simple route without waypoints
        this.calculateRoute(startLocation, endLocation);
      }
    }
  }
  
  // Calculate route between locations
  private calculateRoute(start: LocationData, end: LocationData) {
    this.routeLoading.set(true);
    
    this.mapService.calculateRoute(start, end).subscribe(route => {
      this.routeLoading.set(false);
      
      if (route) {
        this.currentRoute.set(route);
        
        // Update form with calculated distance and duration
        if (route.distance) {
          const distanceInKm = this.extractDistanceValue(route.distance);
          const durationInMinutes = this.extractDurationValue(route.duration || '0 min');
          
          this.tripForm.patchValue({
            distance: distanceInKm,
            duration: durationInMinutes,
            estimatedDuration: durationInMinutes
          });
          
          // Calculate fuel cost based on distance
          this.calculateFuelCost(distanceInKm);
          
          console.log('Route calculated:', {
            distance: distanceInKm + ' km',
            duration: durationInMinutes + ' minutes',
            fuelCost: this.tripForm.get('fuelCost')?.value
          });
        }
      }
    });
  }
  
  // Get location data from form
  private getLocationDataFromForm(type: 'start' | 'end'): LocationData | null {
    const locationGroup = this.tripForm.get(`${type}Location`);
    if (!locationGroup) return null;
    
    const value = locationGroup.value;
    if (!value.address || !value.latitude || !value.longitude) return null;
    
    return {
      address: value.address,
      coordinates: {
        lat: parseFloat(value.latitude),
        lng: parseFloat(value.longitude)
      },
      city: value.city,
      formattedAddress: value.address
    };
  }
  
  // Extract numeric distance value from string
  private extractDistanceValue(distanceStr: string): number {
    const match = distanceStr.match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }
  
  // Extract duration value in minutes from string
  private extractDurationValue(durationStr: string): number {
    const hourMatch = durationStr.match(/([0-9]+)h/);
    const minMatch = durationStr.match(/([0-9]+)min/);
    
    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1]);
    
    return totalMinutes || 30; // Default 30 minutes if parsing fails
  }
  
  // Calculate fuel cost based on distance and selected vehicle
  private calculateFuelCost(distanceKm: number) {
    const vehicleId = this.tripForm.get('vehicleId')?.value;
    if (!vehicleId || !distanceKm) return;
    
    const vehicle = this.vehicles().find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Estimate fuel consumption (assuming 8L/100km average)
    const fuelConsumptionPer100km = 8;
    const fuelPrice = 1.5; // TND per liter (you can make this configurable)
    const fuelCost = (distanceKm / 100) * fuelConsumptionPer100km * fuelPrice;
    
    this.tripForm.patchValue({
      fuelCost: Math.round(fuelCost * 100) / 100 // Round to 2 decimal places
    });
  }
  
  // Location search action
  onLocationSearch(field: string, locationType: 'start' | 'end' | 'waypoint', waypointIndex?: number) {
    const currentValue = this.tripForm.get(
      locationType === 'waypoint' ? `waypoints.${waypointIndex}.${field}` : `${locationType}Location.${field}`
    )?.value;
    
    if (currentValue && typeof currentValue === 'string') {
      this.onLocationInputChange(currentValue, locationType, waypointIndex);
    }
  }

  // Map selection handlers
  onMapLocationSelected(event: any): void {
    if (!event) return;
    const { selectionType, coordinates, locationData, waypointIndex } = event;

    if (selectionType === 'start') {
      const startLocationGroup = this.tripForm.get('startLocation');
      if (startLocationGroup) {
        startLocationGroup.patchValue({
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          address: locationData?.address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
          city: locationData?.city || '',
          state: locationData?.country || ''
        });
      }
    }

    if (selectionType === 'end') {
      const endLocationGroup = this.tripForm.get('endLocation');
      if (endLocationGroup) {
        endLocationGroup.patchValue({
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          address: locationData?.address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
          city: locationData?.city || '',
          state: locationData?.country || ''
        });
      }
    }

    if (selectionType === 'waypoint') {
      // When adding waypoint from map, create new waypoint if needed
      if (waypointIndex === undefined || waypointIndex >= this.waypointsArray.length) {
        // Add new waypoint
        const waypointGroup = this.fb.group({
          latitude: [coordinates.lat, Validators.required],
          longitude: [coordinates.lng, Validators.required],
          address: [locationData?.address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`, Validators.required],
          city: [locationData?.city || '', Validators.required],
          state: [locationData?.country || ''],
          zipCode: ['']
        });
        this.waypointsArray.push(waypointGroup);
      } else {
        // Update existing waypoint
        const waypointGroup = this.waypointsArray.at(waypointIndex);
        if (waypointGroup) {
          waypointGroup.patchValue({
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            address: locationData?.address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
            city: locationData?.city || '',
            state: locationData?.country || ''
          });
        }
      }
    }

    // Trigger route calculation after location selection
    setTimeout(() => this.calculateRouteIfPossible(), 500);
  }

  onMapLocationRemoved(event: any): void {
    // Handle location removal if needed
    console.log('Location removed:', event);
  }

  // Form submission
  async onSubmit() {
    console.log('Submit button clicked', {
      formValid: this.tripForm.valid,
      formValue: this.tripForm.value,
      loading: this.loading()
    });
    
    if (this.tripForm.invalid) {
      console.log('Form is invalid:', this.tripForm.errors);
      this.tripForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const formValue = this.tripForm.value;
      
      // Convert dates to ISO strings
      const createInput: CreateTripInput = {
        vehicleId: formValue.vehicleId,
        driverId: formValue.driverId,
        type: formValue.type,
        status: formValue.status,
        startLocation: formValue.startLocation,
        endLocation: formValue.endLocation,
        waypoints: formValue.waypoints,
        startTime: formValue.startTime?.toISOString(),
        scheduledStartTime: formValue.scheduledStartTime?.toISOString(),
        scheduledEndTime: formValue.scheduledEndTime?.toISOString(),
        endTime: formValue.endTime?.toISOString(),
        distance: formValue.distance,
        duration: formValue.duration,
        estimatedDuration: formValue.estimatedDuration,
        baseRate: formValue.baseRate,
        totalCost: formValue.totalCost,
        fuelCost: formValue.fuelCost,
        additionalFees: formValue.additionalFees,
        notes: formValue.notes,
        customerNotes: formValue.customerNotes,
        internalNotes: formValue.internalNotes
      };

      const result = await this.tripService.createTrip(createInput).toPromise();
      
      if (result) {
        // Navigate back to trips list
        this.router.navigate(['/trips']);
      }
    } catch (error) {
      // Handle error silently or show user notification
    } finally {
      this.loading.set(false);
    }
  }

  // Navigation
  onCancel() {
    console.log('Cancel button clicked - navigating to trips');
    this.router.navigate(['/trips']);
  }

  // Helper methods for form validation
  isFieldRequired(fieldName: string): boolean {
    const field = this.tripForm.get(fieldName);
    return (field?.hasError('required') && field?.touched) || false;
  }

  getFieldError(fieldName: string): string {
    const field = this.tripForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('min')) return 'Value must be greater than 0';
    return '';
  }

  // Helper method to format trip type display
  formatTripType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  // Helper method to format trip status display
  formatTripStatus(status: string): string {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  // Helper methods for template bindings
  getSelectedVehicleName(): string {
    const vehicleId = this.tripForm.get('vehicleId')?.value;
    if (!vehicleId) return 'Not selected';
    const vehicle = this.vehicles().find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown vehicle';
  }

  getSelectedDriverName(): string {
    const driverId = this.tripForm.get('driverId')?.value;
    if (!driverId) return 'Not selected';
    const driver = this.drivers().find(d => d.id === driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown driver';
  }

  getSelectedVehicle(): Vehicle | undefined {
    const vehicleId = this.tripForm.get('vehicleId')?.value;
    return this.vehicles().find(v => v.id === vehicleId);
  }

  getSelectedDriver(): Driver | undefined {
    const driverId = this.tripForm.get('driverId')?.value;
    return this.drivers().find(d => d.id === driverId);
  }

  // Dialog methods
  openVehicleDialog() {
    const dialogRef = this.dialog.open(SelectionDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: {
        title: 'Select Vehicle',
        items: this.vehicles().map(v => ({
          id: v.id,
          primary: `${v.make} ${v.model}`,
          secondary: v.licensePlate || v.vin || 'No plate info',
          icon: 'directions_car',
          badge: v.status
        })),
        selectedId: this.tripForm.get('vehicleId')?.value
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tripForm.patchValue({ vehicleId: result });
      }
    });
  }

  openDriverDialog() {
    const dialogRef = this.dialog.open(SelectionDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: {
        title: 'Select Driver',
        items: this.drivers().map(d => ({
          id: d.id,
          primary: `${d.firstName} ${d.lastName}`,
          secondary: d.phoneNumber || d.email || 'No contact info',
          icon: 'person',
          badge: d.status
        })),
        selectedId: this.tripForm.get('driverId')?.value
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tripForm.patchValue({ driverId: result });
      }
    });
  }

  openTripTypeDialog() {
    const dialogRef = this.dialog.open(SelectionDialogComponent, {
      width: '500px',
      data: {
        title: 'Select Trip Type',
        items: this.tripTypes.map(t => ({
          id: t,
          primary: this.formatTripType(t),
          icon: 'category'
        })),
        selectedId: this.tripForm.get('type')?.value
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tripForm.patchValue({ type: result });
      }
    });
  }

  openStatusDialog() {
    const dialogRef = this.dialog.open(SelectionDialogComponent, {
      width: '500px',
      data: {
        title: 'Select Status',
        items: this.tripStatuses.map(s => ({
          id: s,
          primary: this.formatTripStatus(s),
          icon: 'info'
        })),
        selectedId: this.tripForm.get('status')?.value
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tripForm.patchValue({ status: result });
      }
    });
  }

  // Handle start time changes
  onStartTimeChange() {
    console.log('Start time changed, triggering end time update');
    // Delay slightly to ensure form value is updated
    setTimeout(() => {
      this.updateScheduledEnd();
    }, 100);
  }

  // Format end time for display
  getFormattedEndTime(): string {
    const endTime = this.tripForm.get('scheduledEndTime')?.value;
    if (!endTime) return '';
    
    try {
      const date = new Date(endTime);
      if (isNaN(date.getTime())) return '';
      
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return '';
    }
  }
}
