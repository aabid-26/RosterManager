package com.example.RosterManager;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service // Tells Spring to manage this class
public class PlayerService {

    // Our temporary in-memory database
    private List<Player> roster = new ArrayList<>();
    private Long nextId = 1L;

    // READ: Get all players
    public List<Player> getAllPlayers() {
        return roster;
    }

    // CREATE: Add a new player
    public Player addPlayer(Player player) {
        player.setId(nextId++);
        roster.add(player);
        return player;
    }

    // UPDATE: Modify an existing player
    public Player updatePlayer(Long id, Player updatedPlayer) {
        for (Player p : roster) {
            if (p.getId().equals(id)) {
                p.setName(updatedPlayer.getName());
                p.setPosition(updatedPlayer.getPosition());
                p.setJerseyNumber(updatedPlayer.getJerseyNumber());
                return p;
            }
        }
        return null; // In a real app, you'd throw an exception here
    }

    // DELETE: Remove a player
    public boolean deletePlayer(Long id) {
        return roster.removeIf(p -> p.getId().equals(id));
    }
}
