package com.fastfood;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Order placement, history, scoping and server-side totals. */
class OrderFlowIntegrationTest extends IntegrationTestSupport {

    static final String ORDER_BODY = """
            {"restaurantId":"r1","restaurantName":"Stacked & Smashed","address":"18 Market Street, Apt 4B",
             "phone":"+1 555 012 4488","paymentMethod":"COD","instructions":"Leave at the door",
             "schedule":"ASAP","promoCode":"RUSH20","tip":2,
             "items":[{"id":"r1-1","baseId":"r1-1","name":"The Rush Crispy Double","price":12.5,"quantity":2}]}
            """;

    private String placeOrder(String token, String body) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/orders")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    void protectedRoutesRequireAuthenticationAndTheRightRole() throws Exception {
        mockMvc.perform(get("/api/orders/my")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/orders/my").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());

        String customer = login("customer@fastfood.app");
        mockMvc.perform(get("/api/orders/my").header("Authorization", bearer(customer)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/users").header("Authorization", bearer(customer)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/delivery/assigned").header("Authorization", bearer(customer)))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/restaurants/menu-items")
                        .header("Authorization", bearer(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"restaurantId\":\"r1\",\"name\":\"Nope\",\"price\":1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void customerOrderHistoryIncludesTheSeededOrders() throws Exception {
        String customer = login("customer@fastfood.app");

        mockMvc.perform(get("/api/orders/my").header("Authorization", bearer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id").value(hasItems("FR-2048", "FR-1986", "FR-1840", "FR-2201", "FR-2202")))
                .andExpect(jsonPath("$[?(@.id=='FR-2048')].restaurantName").value(hasItems("Stacked & Smashed")))
                .andExpect(jsonPath("$[?(@.id=='FR-2048')].rider.name").value(hasItems("Marcus Reed")));
    }

    @Test
    void placingAnOrderRecomputesTotalsServerSide() throws Exception {
        String customer = login("customer@fastfood.app");

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", bearer(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ORDER_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.subtotal").value(25.0))
                .andExpect(jsonPath("$.discount").value(5.0))
                .andExpect(jsonPath("$.serviceFee").value(1.49))
                .andExpect(jsonPath("$.deliveryFee").value(1.99))
                .andExpect(jsonPath("$.tip").value(2.0))
                .andExpect(jsonPath("$.total").value(25.48))
                .andExpect(jsonPath("$.date").isNotEmpty())
                .andExpect(jsonPath("$.items").value(hasSize(1)))
                .andExpect(jsonPath("$.items[0].id").value("r1-1"))
                .andExpect(jsonPath("$.items[0].name").value("The Rush Crispy Double"))
                .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    void ordersAreScopedToTheirOwner() throws Exception {
        String customer = login("customer@fastfood.app");
        String otherCustomer = login("avery@example.com");
        String orderId = placeOrder(customer, ORDER_BODY);

        mockMvc.perform(get("/api/orders/" + orderId).header("Authorization", bearer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId));

        mockMvc.perform(get("/api/orders/" + orderId).header("Authorization", bearer(otherCustomer)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/orders/does-not-exist").header("Authorization", bearer(customer)))
                .andExpect(status().isNotFound());
    }

    @Test
    void freeShippingPromoAndFreeDeliveryThresholdAreApplied() throws Exception {
        String customer = login("customer@fastfood.app");

        // Over the $35 threshold: delivery becomes free even though r1 charges a fee.
        String bigOrder = ORDER_BODY.replace("\"promoCode\":\"RUSH20\"", "\"promoCode\":null")
                .replace("\"quantity\":2", "\"quantity\":4");
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", bearer(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bigOrder))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subtotal").value(50.0))
                .andExpect(jsonPath("$.deliveryFee").value(0.0))
                .andExpect(jsonPath("$.discount").value(0.0));

        String freeShipOrder = ORDER_BODY.replace("\"promoCode\":\"RUSH20\"", "\"promoCode\":\"FREESHIP\"");
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", bearer(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(freeShipOrder))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.discount").value(0.0))
                .andExpect(jsonPath("$.deliveryFee").value(0.0))
                .andExpect(jsonPath("$.total").value(28.49));
    }
}