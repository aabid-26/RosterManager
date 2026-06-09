package com.example.RosterManager;

public class Player {
    private Long id;
    private String name;
    private String position;
    private int jerseyNumber;

    // Default constructor needed for Spring to parse JSON
    public Player() {}

    public Player(Long id, String name, String position, int jerseyNumber) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.jerseyNumber = jerseyNumber;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public int getJerseyNumber() { return jerseyNumber; }
    public void setJerseyNumber(int jerseyNumber) { this.jerseyNumber = jerseyNumber; }
}
