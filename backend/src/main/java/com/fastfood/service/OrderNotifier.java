package com.fastfood.service;

import com.fastfood.dto.OrderStatusMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/** Broadcasts order status changes to {@code /topic/orders/{orderId}} for live tracking. */
@Service
public class OrderNotifier {

    private final SimpMessagingTemplate messagingTemplate;

    public OrderNotifier(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishStatus(String orderId, String status, String date) {
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, new OrderStatusMessage(orderId, status, date));
    }
}