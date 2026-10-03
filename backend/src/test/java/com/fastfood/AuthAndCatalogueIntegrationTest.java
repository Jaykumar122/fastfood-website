package com.fastfood;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.lessThan;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Auth + public catalogue endpoints against a real, seeded application context. */
class AuthAndCatalogueIntegrationTest extends IntegrationTestSupport {

    @Test
    void loginReturnsATokenAndTheAccountsRealRole() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"customer@fastfood.app\",\"password\":\"password\",\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("customer@fastfood.app"))
                .andExpect(jsonPath("$.user.name").value("Avery Morgan"))
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"));
    }

    @Test
    void loginRejectsWrongCredentialsAndInvalidPayloads() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"customer@fastfood.app\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"x\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerCreatesACustomerRejectsAdminSignupAndDuplicates() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New Diner\",\"email\":\"new.diner@example.com\",\"password\":\"secret123\",\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Sneaky Admin\",\"email\":\"sneaky@example.com\",\"password\":\"secret123\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Dup\",\"email\":\"customer@fastfood.app\",\"password\":\"secret123\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void catalogueIsPublicAndOnlyExposesApprovedVenues() throws Exception {
        mockMvc.perform(get("/api/restaurants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(greaterThanOrEqualTo(15)))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.content[0].name").isNotEmpty())
                .andExpect(jsonPath("$.content[*].id").value(not(hasItems("r6"))));
    }

    @Test
    void catalogueFiltersAndSortingWork() throws Exception {
        mockMvc.perform(get("/api/restaurants").param("cuisine", "Indian"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].cuisine").value(everyItem(is("Indian"))));

        mockMvc.perform(get("/api/restaurants").param("topRated", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].rating").value(greaterThanOrEqualTo(4.7)));

        mockMvc.perform(get("/api/restaurants").param("freeDelivery", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].deliveryFee").value(everyItem(lessThan(1.0))));

        mockMvc.perform(get("/api/restaurants").param("search", "biryani"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id").value(hasItems("r15")));

        mockMvc.perform(get("/api/restaurants").param("sort", "rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].rating").value(greaterThanOrEqualTo(4.8)));
    }

    @Test
    void detailMenuReviewsAndPopularDishesMatchTheFrontendShape() throws Exception {
        mockMvc.perform(get("/api/restaurants/r1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Stacked & Smashed"))
                .andExpect(jsonPath("$.etaMin").value(22))
                .andExpect(jsonPath("$.tags").value(hasSize(3)));

        mockMvc.perform(get("/api/restaurants/r1/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(hasSize(11)))
                .andExpect(jsonPath("$[0].id").value("r1-1"))
                .andExpect(jsonPath("$[0].options").value(hasSize(2)))
                .andExpect(jsonPath("$[0].options[0].name").value("Patty"))
                .andExpect(jsonPath("$[0].options[0].required").value(true))
                .andExpect(jsonPath("$[0].options[0].choices[0].price").value(0.0))
                .andExpect(jsonPath("$[8].available").value(false));

        mockMvc.perform(get("/api/restaurants/r1/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(hasSize(4)))
                .andExpect(jsonPath("$[0].name").isNotEmpty())
                .andExpect(jsonPath("$[0].date").isNotEmpty());

        mockMvc.perform(get("/api/restaurants/popular-dishes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].restaurant.name").isNotEmpty())
                .andExpect(jsonPath("$[0].bestseller").value(true));

        mockMvc.perform(get("/api/restaurants/does-not-exist"))
                .andExpect(status().isNotFound());
    }

    @Test
    void promoValidationIsPublic() throws Exception {
        mockMvc.perform(post("/api/promos/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"rush20\",\"subtotal\":40}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("RUSH20"))
                .andExpect(jsonPath("$.type").value("percent"))
                .andExpect(jsonPath("$.value").value(20))
                .andExpect(jsonPath("$.label").value("20% off your food"));

        mockMvc.perform(post("/api/promos/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"NOPE\",\"subtotal\":40}"))
                .andExpect(status().isBadRequest());
    }
}