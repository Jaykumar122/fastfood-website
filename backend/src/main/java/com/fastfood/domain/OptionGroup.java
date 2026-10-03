package com.fastfood.domain;

import java.util.ArrayList;
import java.util.List;

/**
 * A customization group for a menu item (e.g. "Size", "Add extras").
 * Serialized to a JSON column via {@link OptionGroupListConverter}.
 */
public class OptionGroup {

    private String id;
    private String name;
    private boolean required;
    private boolean multi;
    private List<OptionChoice> choices = new ArrayList<>();

    public OptionGroup() {
    }

    public OptionGroup(String id, String name, boolean required, boolean multi, List<OptionChoice> choices) {
        this.id = id;
        this.name = name;
        this.required = required;
        this.multi = multi;
        this.choices = choices;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public boolean isMulti() {
        return multi;
    }

    public void setMulti(boolean multi) {
        this.multi = multi;
    }

    public List<OptionChoice> getChoices() {
        return choices;
    }

    public void setChoices(List<OptionChoice> choices) {
        this.choices = choices;
    }
}