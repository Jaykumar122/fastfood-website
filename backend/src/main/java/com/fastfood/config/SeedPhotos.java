package com.fastfood.config;

/** Unsplash photo ids used by the seed data (mirrors front-end/src/mocks/data.js). */
public final class SeedPhotos {

    public static final String[] PIZZA = {
            "1574071318508-1cdbab80d002", "1598023696416-0193a0bcd302",
            "1571997478779-2adcbbe9ab2f", "1579751626657-72bc17010498"};
    public static final String[] PASTA = {
            "1600803907087-f56d462fd26b", "1516100882582-96c3a05fe590",
            "1473093226795-af9932fe5856", "1473093295043-cdd812d0e601"};
    public static final String[] SALAD = {
            "1623428187969-5da2dcea5ebf", "1547496502-affa22d38842",
            "1646487793655-bbf280273d2f", "1512621776951-a57141f2eefd"};
    public static final String[] INDIAN = {
            "1585937421612-70a008356fbe", "1565557623262-b51c2513a641", "1631452180539-96aca7d48617",
            "1603894584373-5ac82b2ae398", "1596797038530-2c107229654b"};
    public static final String[] SUSHI = {
            "1553621042-f6e147245754", "1611143669185-af224c5e3252", "1579871494447-9811cf80d66c"};
    public static final String[] RAMEN = {
            "1612927601601-6638404737ce", "1734313276354-75c96b3c0c36", "1697652974652-a2336106043b"};
    public static final String[] TACO = {
            "1599974579688-8dbdd335c77f", "1565299585323-38d6b0865b47", "1551504734-5ee1c4a1479b"};
    public static final String[] CHICKEN = {
            "1586793783658-261cddf883ef", "1585703900468-13c7a978ad86",
            "1624153064067-566cae78993d", "1637273484026-11d51fb64024"};
    public static final String[] DUMPLING = {
            "1496116218417-1a781b1c416c", "1534422298391-e4f8c172dddb", "1638502338747-f7f368214cce"};
    public static final String[] BREAKFAST = {
            "1528207776546-365bb710ee93", "1506084868230-bb9d95c24759",
            "1612182062633-9ff3b3598e96", "1541288097308-7b8e3f58c4c6"};
    public static final String[] DESSERT = {
            "1588195538326-c5b1e9f80a1b", "1568827999250-3f6afff96e66",
            "1605807646983-377bc5a76493", "1530648672449-81f6c723e2f1"};
    public static final String[] FRIES = {
            "1598679253544-2c97992403ea", "1630431341973-02e1b662ec35", "1606755456206-b25206cde27e"};
    public static final String[] SHAKE = {
            "1572490122747-3968b75cc699", "1553787499-6f9133860278", "1579954115545-a95591f28bfc"};
    public static final String[] COFFEE = {
            "1461023058943-07fcbe16d735", "1517701550927-30cf4ba1dba5", "1562447457-579fc34967fb"};
    public static final String[] BURGER = {
            "1606755962773-d324e0a13086", "1655895176036-bf1a11326e5c", "1637710847214-f91d99669e18",
            "1692737349870-e3bfc704ebf9", "1520073201527-6b044ba2ca9f"};

    private SeedPhotos() {
    }

    /** Builds a full Unsplash URL from a photo id. */
    public static String photo(String id) {
        return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=900&q=80";
    }
}