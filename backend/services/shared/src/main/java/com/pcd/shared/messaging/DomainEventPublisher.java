package com.pcd.shared.messaging;

public interface DomainEventPublisher {

    void publish(String topic, String key, Object event);
}
