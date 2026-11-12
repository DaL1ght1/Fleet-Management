package com.pcd.userservice.domain;

public record CustomerDetails(String firstName, String lastName, String email, String phoneNumber) {

    public CustomerDetails {
        firstName = ContactRules.name(firstName, "firstName");
        lastName = ContactRules.name(lastName, "lastName");
        email = ContactRules.email(email);
        phoneNumber = ContactRules.phone(phoneNumber, false);
    }

    public CustomerDetails merge(String newFirstName, String newLastName, String newEmail, String newPhoneNumber) {
        return new CustomerDetails(
                newFirstName != null ? newFirstName : firstName,
                newLastName != null ? newLastName : lastName,
                newEmail != null ? newEmail : email,
                newPhoneNumber != null ? newPhoneNumber : phoneNumber);
    }
}
