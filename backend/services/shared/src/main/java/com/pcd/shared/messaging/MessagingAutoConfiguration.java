package com.pcd.shared.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcd.shared.events.Topics;
import com.pcd.shared.messaging.outbox.OutboxDomainEventPublisher;
import com.pcd.shared.messaging.outbox.OutboxProperties;
import com.pcd.shared.messaging.outbox.OutboxRelay;
import org.apache.kafka.common.serialization.ByteArraySerializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.JdbcClientAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.kafka.core.KafkaOperations;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.backoff.ExponentialBackOff;

import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.Map;

@AutoConfiguration(after = {KafkaAutoConfiguration.class, HibernateJpaAutoConfiguration.class,
        DataSourceTransactionManagerAutoConfiguration.class, JdbcClientAutoConfiguration.class})
@ConditionalOnClass(KafkaTemplate.class)
public class MessagingAutoConfiguration {

    private static final int TOPIC_PARTITIONS = 3;
    private static final int MAX_DELIVERY_ATTEMPTS = 4;

    @Bean
    @ConditionalOnMissingBean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    KafkaAdmin.NewTopics smartStreetTopics() {
        return new KafkaAdmin.NewTopics(Topics.ALL.stream()
                .map(topic -> TopicBuilder.name(topic).partitions(TOPIC_PARTITIONS).replicas(1).build())
                .toArray(org.apache.kafka.clients.admin.NewTopic[]::new));
    }

    @Bean
    @ConditionalOnMissingBean(CommonErrorHandler.class)
    DefaultErrorHandler deadLetteringErrorHandler(KafkaProperties kafkaProperties) {
        Map<String, Object> producerProperties = kafkaProperties.buildProducerProperties(null);
        Map<Class<?>, KafkaOperations<?, ?>> templates = new LinkedHashMap<>();
        templates.put(byte[].class, new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(
                producerProperties, new StringSerializer(), new ByteArraySerializer())));
        templates.put(Object.class, new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(
                producerProperties, new StringSerializer(), new JsonSerializer<>())));
        ExponentialBackOff backOff = new ExponentialBackOff(500, 2.0);
        backOff.setMaxAttempts(MAX_DELIVERY_ATTEMPTS - 1);
        return new DefaultErrorHandler(new DeadLetterPublishingRecoverer(templates), backOff);
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(JdbcClient.class)
    @ConditionalOnBean({JdbcClient.class, PlatformTransactionManager.class})
    @EnableScheduling
    @EnableConfigurationProperties(OutboxProperties.class)
    static class OutboxConfiguration {

        @Bean
        @ConditionalOnMissingBean(DomainEventPublisher.class)
        OutboxDomainEventPublisher outboxDomainEventPublisher(JdbcClient jdbcClient, ObjectMapper objectMapper,
                                                              Clock clock) {
            return new OutboxDomainEventPublisher(jdbcClient, objectMapper, clock);
        }

        @Bean
        OutboxRelay outboxRelay(JdbcClient jdbcClient, KafkaTemplate<String, String> kafkaTemplate,
                                PlatformTransactionManager transactionManager, OutboxProperties properties,
                                Clock clock) {
            return new OutboxRelay(jdbcClient, kafkaTemplate, new TransactionTemplate(transactionManager),
                    properties, clock);
        }
    }
}
