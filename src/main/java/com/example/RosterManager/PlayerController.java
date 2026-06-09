package com.example.RosterManager;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController // Tells Spring this class handles REST API requests
@RequestMapping("/api/players") // The base URL for all methods in this class
@CrossOrigin(origins = "http://localhost:3000") // Crucial: Allows your React app to talk to this API
public class PlayerController {

    private final PlayerService playerService;

    // Spring automatically injects the service here
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public List<Player> getRoster() {
        return playerService.getAllPlayers();
    }

    @PostMapping
    public Player createPlayer(@RequestBody Player player) {
        return playerService.addPlayer(player);
    }

    @PutMapping("/{id}")
    public Player updatePlayer(@PathVariable Long id, @RequestBody Player player) {
        return playerService.updatePlayer(id, player);
    }

    @DeleteMapping("/{id}")
    public void deletePlayer(@PathVariable Long id) {
        playerService.deletePlayer(id);
    }
}