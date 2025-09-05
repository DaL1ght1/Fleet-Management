package com.pcd.vehicles.exceptions;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.StandardException;

@EqualsAndHashCode(callSuper=true)
@Data
public class VehicleNotFoundException extends RuntimeException {
    private final String msg ;
}
