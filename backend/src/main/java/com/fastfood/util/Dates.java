package com.fastfood.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** Formats timestamps the way the frontend displays them (Today, Yesterday, "Mar 9, 8:03 PM"). */
public final class Dates {

    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("h:mm a", Locale.US);
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("MMM d, h:mm a", Locale.US);

    private Dates() {
    }

    public static String friendly(Instant instant) {
        if (instant == null) {
            return "";
        }
        ZonedDateTime zoned = instant.atZone(ZoneId.systemDefault());
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        LocalDate day = zoned.toLocalDate();
        if (day.equals(today)) {
            return "Today, " + TIME.format(zoned);
        }
        if (day.equals(today.minusDays(1))) {
            return "Yesterday, " + TIME.format(zoned);
        }
        return DATE_TIME.format(zoned);
    }
}