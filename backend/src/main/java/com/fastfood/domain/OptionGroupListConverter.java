package com.fastfood.domain;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

/** Persists a list of {@link OptionGroup} as a JSON string. */
@Converter
public class OptionGroupListConverter implements AttributeConverter<List<OptionGroup>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<OptionGroup>> TYPE = new TypeReference<>() {
    };

    @Override
    public String convertToDatabaseColumn(List<OptionGroup> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (Exception ex) {
            return "[]";
        }
    }

    @Override
    public List<OptionGroup> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return MAPPER.readValue(dbData, TYPE);
        } catch (Exception ex) {
            return new ArrayList<>();
        }
    }
}