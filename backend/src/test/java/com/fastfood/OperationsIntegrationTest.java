package com.fastfood;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Restaurant-owner and admin console flows. */
class OperationsIntegrationTest extends IntegrationTestSupport {

    @Test
    void ownerSeesOnlyTheirRestaurantOrdersAndCanDriveKitchenStatus() throws Exception {
        String owner = login("owner@fastfood.app");

        mockMvc.perform(get("/api/orders/restaurant").header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id").value(hasItems("FR-2048", "FR-2202")))
                .andExpect(jsonPath("$[*].restaurantId").value(everyItem(is("r1"))));

        mockMvc.perform(put("/api/orders/FR-2048/status")
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"preparing\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PREPARING"));

        mockMvc.perform(put("/api/orders/FR-2048/status")
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"TELEPORTED\"}"))
                .andExpect(status().isBadRequest());

        // Another restaurant's order is off limits.
        mockMvc.perform(get("/api/orders/FR-1840").header("Authorization", bearer(owner)))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/orders/FR-1840/status")
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PREPARING\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminListsUsersSafelyAndApprovesRestaurants() throws Exception {
        String admin = login("admin@fastfood.app");

        mockMvc.perform(get("/api/admin/users").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(hasSize(greaterThanOrEqualTo(6))))
                .andExpect(jsonPath("$[*].email").value(hasItems(
                        "customer@fastfood.app", "owner@fastfood.app", "rider@fastfood.app", "admin@fastfood.app")))
                .andExpect(jsonPath("$[?(@.email=='noah@example.com')].active").value(hasItems(false)))
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$[0].password").doesNotExist());

        mockMvc.perform(put("/api/admin/restaurants/r6/approve").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("r6"))
                .andExpect(jsonPath("$.approved").value(true));

        mockMvc.perform(get("/api/restaurants").param("cuisine", "Mexican"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id").value(hasItems("r6")));

        mockMvc.perform(put("/api/admin/restaurants/missing/approve").header("Authorization", bearer(admin)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deliveryPartnerHandlesAssignedJobsAndClaimsUnassignedOnes() throws Exception {
        String rider = login("rider@fastfood.app");

        mockMvc.perform(get("/api/delivery/assigned").header("Authorization", bearer(rider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id").value(hasItems("FR-2201", "FR-2202")));

        // An order belonging to another rider is not visible.
        mockMvc.perform(get("/api/orders/FR-1840").header("Authorization", bearer(rider)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/orders/FR-2201").header("Authorization", bearer(rider)))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/delivery/FR-2202/status")
                        .header("Authorization", bearer(rider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"out_for_delivery\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OUT_FOR_DELIVERY"))
                .andExpect(jsonPath("$.rider.name").value("Marcus Reed"));

        // An unassigned order gets claimed by the rider who updates it.
        mockMvc.perform(put("/api/delivery/FR-1986/status")
                        .header("Authorization", bearer(rider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PICKED_UP\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rider.name").value("Marcus Reed"));

        mockMvc.perform(put("/api/delivery/unknown-order/status")
                        .header("Authorization", bearer(rider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PICKED_UP\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void paymentIntentCanBeCreatedAndVerified() throws Exception {
        String customer = login("customer@fastfood.app");

        MvcResult created = mockMvc.perform(post("/api/payments/create")
                        .header("Authorization", bearer(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":25.48,\"currency\":\"USD\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.reference").isNotEmpty())
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andExpect(jsonPath("$.provider").value("mock-gateway"))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andReturn();

        // The frontend posts the created payment object straight back to /verify.
        String paymentBody = created.getResponse().getContentAsString();
        mockMvc.perform(post("/api/payments/verify")
                        .header("Authorization", bearer(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(paymentBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.status").value("VERIFIED"))
                .andExpect(jsonPath("$.paymentId").isNotEmpty());
    }

    @Test
    void ownerCanCreateUpdateAndDeleteTheirOwnMenuItems() throws Exception {
        String owner = login("owner@fastfood.app");

        MvcResult created = mockMvc.perform(post("/api/restaurants/menu-items")
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"restaurantId\":\"r1\",\"name\":\"Chef Special\",\"description\":\"Test dish\","
                                + "\"price\":9.5,\"category\":\"Specials\",\"veg\":true,\"available\":true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Chef Special"))
                .andExpect(jsonPath("$.restaurantId").value("r1"))
                .andExpect(jsonPath("$.veg").value(true))
                .andExpect(jsonPath("$.available").value(true))
                .andReturn();
        String dishId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(put("/api/restaurants/menu-items")
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"" + dishId + "\",\"restaurantId\":\"r1\",\"name\":\"Chef Special v2\","
                                + "\"price\":11.0,\"available\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Chef Special v2"))
                .andExpect(jsonPath("$.price").value(11.0))
                .andExpect(jsonPath("$.available").value(false));

        // The owner cannot touch another restaurant's dish.
        mockMvc.perform(put("/api/restaurants/menu-items")
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"r2-1\",\"restaurantId\":\"r2\",\"name\":\"Hijacked\",\"price\":1}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/restaurants/menu-items/" + dishId)
                        .header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted").value(true));

        mockMvc.perform(get("/api/restaurants/r1/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(hasSize(11)));
    }
}