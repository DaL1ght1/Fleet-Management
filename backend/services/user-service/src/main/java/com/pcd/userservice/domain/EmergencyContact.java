package com.pcd.userservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public record EmergencyContact(
        @Column(name = "emergency_contact_name") String name,
        @Column(name = "emergency_contact_phone") String phoneNumber) {

    public EmergencyContact {
        name = ContactRules.name(name, "emergencyContact.name");
        phoneNumber = ContactRules.phone(phoneNumber, true);
    }
}
