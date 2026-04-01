
## Archimedes Concepts

### Core concepts

**Simulator**  
Abstract class that holds a game state and a `simulate` method. Also has a `tailor` method which can extract a subset of the state for a specific author.
- *Author ID*, clarifies who an input is coming from. Host alwaysg gets authorId `0`, each connected client gets a different number.
- *Telegram*, stream of information about the changing state of a simulation. Includes dispatches about state, delta, and input.
- *Schema*, the types that a simulator operates on.
  - `state`, full representation of the game state.
  - `delta`, partial game state, reprents an update/patch to be applied to the state.
  - `input`, data that clients send back to the host, which may influence the simulation.

**Liaison**  
Symmetric comms channel, which handles ping/pongs, jitter-smoothing, inbox and outbox. Clients and hosts use a liaison.

**Authority**  
Hosting rig. Wires a simulator up with a liaison, providing a tick method that handles all communications.

**Speculator**  
Client rig. Bundles up a pastSimulator and a futureSimulator, and coordinates with a liaison to implement roll-forward networking. Clientside should render the state of the futureSimulator, as it represents the clientside prediction.

### Session concepts

**SessionHost**  
Creates an Authority and coordinates metadata and userland api setup.

**SessionClient**  
Creates a Speculator and coordinates metadata and userland api setup.

