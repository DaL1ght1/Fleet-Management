import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DriverService, Driver, DriverStatus, DriverInput } from '../../../services/driver.service';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './driver-form.component.html',
  styleUrl: './driver-form.component.scss'
})
export class DriverFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private driverService = inject(DriverService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  
  driverForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  driverId: string | null = null;
  
  constructor() {
    this.driverForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      licenseNumber: [''],
      licenseExpiryDate: [''],
      status: ['ACTIVE'],
      dateOfBirth: [''],
      hireDate: [''],
      emergencyContactName: [''],
      emergencyContactPhone: ['']
    });
  }
  
  async ngOnInit(): Promise<void> {
    this.driverId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.driverId;
    
    if (this.isEditMode && this.driverId) {
      await this.loadDriver(this.driverId);
    }
  }
  
  private async loadDriver(id: string): Promise<void> {
    this.isLoading = true;
    
    try {
      const driver = await this.driverService.getDriver(id).toPromise();
      if (driver) {
        this.driverForm.patchValue({
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          phone: driver.phone,
          licenseNumber: driver.licenseNumber,
          licenseExpiryDate: driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate) : null,
          status: driver.status,
          dateOfBirth: driver.dateOfBirth ? new Date(driver.dateOfBirth) : null,
          hireDate: driver.hireDate ? new Date(driver.hireDate) : null,
          emergencyContactName: driver.emergencyContactName,
          emergencyContactPhone: driver.emergencyContactPhone
        });
      }
    } catch (error) {
      console.error('Error loading driver:', error);
      this.snackBar.open(
        this.translate.instant('drivers.messages.loadError'),
        'Close',
        { duration: 5000 }
      );
    } finally {
      this.isLoading = false;
    }
  }
  
  async onSubmit(): Promise<void> {
    if (this.driverForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    try {
      console.log('📝 Form valid:', this.driverForm.valid);
      console.log('📝 Form status:', this.driverForm.status);
      console.log('📝 Form errors:', this.driverForm.errors);
      
      const formValue = this.driverForm.value;
      console.log('📝 Raw form value:', formValue);
      
      const driverInput: DriverInput = this.cleanDriverInput({
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        licenseNumber: formValue.licenseNumber,
        licenseExpiryDate: formValue.licenseExpiryDate ? formValue.licenseExpiryDate.toISOString().split('T')[0] : undefined,
        status: formValue.status as DriverStatus,
        dateOfBirth: formValue.dateOfBirth ? formValue.dateOfBirth.toISOString().split('T')[0] : undefined,
        hireDate: formValue.hireDate ? formValue.hireDate.toISOString().split('T')[0] : undefined,
        emergencyContactName: formValue.emergencyContactName,
        emergencyContactPhone: formValue.emergencyContactPhone
      });
      
      if (this.isEditMode && this.driverId) {
        console.log('📝 Starting driver update process...');
        console.log('📝 Driver ID:', this.driverId);
        console.log('📝 Driver input:', driverInput);
        
        const result = await this.driverService.updateDriver(this.driverId, driverInput).toPromise();
        console.log('📝 Update result:', result);
        
        if (result) {
          this.snackBar.open(
            this.translate.instant('drivers.messages.updateSuccess'),
            'Close',
            { duration: 3000 }
          );
        } else {
          throw new Error('Update returned null result');
        }
      } else {
        await this.driverService.createDriver(driverInput).toPromise();
        this.snackBar.open(
          this.translate.instant('drivers.messages.createSuccess'),
          'Close',
          { duration: 3000 }
        );
      }
      
      this.router.navigate(['/drivers']);
    } catch (error) {
      console.error('Error saving driver:', error);
      this.snackBar.open(
        this.translate.instant('drivers.messages.saveError'),
        'Close',
        { duration: 5000 }
      );
    } finally {
      this.isLoading = false;
    }
  }
  
  onCancel(): void {
    this.router.navigate(['/drivers']);
  }
  
  /**
   * Clean driver input by converting empty strings to undefined
   * This prevents sending empty strings to the backend which might cause validation issues
   */
  private cleanDriverInput(input: DriverInput): DriverInput {
    const cleaned: DriverInput = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email
    };
    
    // Only include optional fields if they have values
    if (input.phone && input.phone.trim() !== '') {
      cleaned.phone = input.phone.trim();
    }
    
    if (input.licenseNumber && input.licenseNumber.trim() !== '') {
      cleaned.licenseNumber = input.licenseNumber.trim();
    }
    
    if (input.licenseExpiryDate) {
      cleaned.licenseExpiryDate = input.licenseExpiryDate;
    }
    
    if (input.status) {
      cleaned.status = input.status;
    }
    
    if (input.dateOfBirth) {
      cleaned.dateOfBirth = input.dateOfBirth;
    }
    
    if (input.hireDate) {
      cleaned.hireDate = input.hireDate;
    }
    
    if (input.emergencyContactName && input.emergencyContactName.trim() !== '') {
      cleaned.emergencyContactName = input.emergencyContactName.trim();
    }
    
    if (input.emergencyContactPhone && input.emergencyContactPhone.trim() !== '') {
      cleaned.emergencyContactPhone = input.emergencyContactPhone.trim();
    }
    
  console.log('📝 Cleaned driver input:', cleaned);
    return cleaned;
  }
}