package com.pcd.userservice.infrastructure.messaging;

import com.pcd.shared.events.AccountEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.userservice.application.CustomerService;
import com.pcd.userservice.application.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PeopleEventsListener {

    private final DriverService driverService;
    private final CustomerService customerService;

    @KafkaListener(topics = Topics.TRIP_EVENTS)
    public void onTripEvent(TripEvent event) {
        driverService.onTripEvent(event);
    }

    @KafkaListener(topics = Topics.ACCOUNT_EVENTS)
    public void onAccountEvent(AccountEvent event) {
        customerService.onAccountEvent(event);
        driverService.onAccountEvent(event);
    }
}
