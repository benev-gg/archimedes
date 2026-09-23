
![](https://i.imgur.com/mKSNcTS.png)

# 🌀 archimedes, architecture for web games

> [***"do not disturb my circles!"***](https://en.wikipedia.org/wiki/noli_turbare_circulos_meos!)  
> &nbsp; &nbsp; — *archimedes, c. 212 bc*

```bash
npm install @benev/archimedes
```

**archimedes is an ecs toolkit for making great web games.**  
entities look and feel like normal js data, so your game logic stays simple.  
but under the hood, archimedes is tightly packing most data into contiguous blocks of memory.  
*compact storage. efficient networking. strong typescript typings.*

**rollback multiplayer.**  
archimedes is designed for singleplayer and multiplayer games alike.  
you basically program your whole game as though it's singleplayer, archimedes automates the gnarly netcode.

**it's not a rendering engine.**  
archimedes helps you structure your game's simulation, keeping it ready for multithreading and multiplayer.  
for rendering, you might want something like [babylon lite](https://www.babylonjs.com/lite/).

- 🎮 ***[#simple,](#simple)*** **game example**
- 🧩 ***[#components,](#components)*** **properties your entities can have**
- 👾 ***[#entities,](#entities)*** **things in your game**



<br/><a id="simple"></a>

## 🎮 simple, game example

```ts
import {Entities, i8, vec2, makeId} from "@benev/archimedes"
```

1. **establish entities and components.**
    ```ts
    const entities = new Entities({health: i8, position: vec2})
    ```
1. **create your first entity.**
    ```ts
    entities.set(makeId(), {health: 100, position: [0, 0]})
    ```
1. **write your game logic.**
    ```ts
    function simulate() {

      // hazards deal damage
      for (const [id, {health, position: [x, y]}] of entities.select("health", "position"))
        if (y < 0)
          entities.update(id, {health: health - 1})

      // dead things disappear
      for (const [id, {health}] of entities.select("health"))
        if (health <= 0)
          entities.delete(id)
    }
    ```
1. **start the simulation.**
    ```ts
    setInterval(simulate, 16.67)
    ```



<br/><a id="components"></a>

## 🧩 components, properties your entities can have

```ts
import {asComponents, u8, i16, vec3, f32, tuple, bytes, json} from "@benev/archimedes"
```

- **establish your game's components.**
    ```ts
    const components = asComponents({
      level: u8,
      health: i16,
      color: vec3,
      position: tuple(f32, f32, f32), // same as vec3
      avatar: bytes(), // variable-sized Uint8Array
      inventory: json<string[]>(), // arbitrary json is allowed
    })
    ```
- **components are your entity schema.**
    - in archimedes terminology, a "component" is the binary schema for the "values" your entities can have.
    - you can click components together using the `tuple` helper.
- **how components work.**
    - each component has its own functions for encoding and decoding between binary and js values.
    - use the `asComponent` helper to make your own components from scratch.
    - simple components are `FixedComponents`, values for these are stored in contiguous memory blocks.
    - complex components (like `bytes` and `json`) are `VariableComponents`, values for these are stored differently (likely slower).



<br/><a id="entities"></a>

## 👾 entities, things in your game

```ts
import {Entities, makeId} from "@benev/archimedes"
```

### `entities` feels like a js map

1. **establish your entities**.
    ```ts
    const entities = new Entities(components)
    ```
    - `entities` seems a lot like a normal js map... *(but it's secretly not, tee hee!)*
1. **create an entity.**
    ```ts
    // create an entity
    const id = entities.set(makeId(), {
      health: 100,
      position: [1, 2, 3],
    })
    ```
    - note about `makeId()` -- archimedes entity ids are hex-coded 128 bit strings. they are random, and with enough entropy that you'll never generate the same one twice. however, if you supply makeId with parameters, the id will be a deterministic hash of those parameters. networked clientside prediction works smoother whenever the id of a new entity can be causally determined, like `makeId(playerId, "arrow", arrowCount)`
1. **get an entity.**
    ```ts
    // get an entity's values
    entities.get(id) // {health: 100, position: [1, 2, 3]}
    ```
    - note, these values are just a snapshot (mutating them has no effect)
1. **update an entity,** applying a partial patch.
    ```ts
    entities.update(id, {health: 99})
      // only update health value
    ```
    - in updates, and `undefined` value means "delete this value"
1. **delete an entity.**
    ```ts
    entities.delete(id)
    ```
1. **typical map iteration fns.** (.keys(), .values(), .entries(), etc)
    ```ts
    for (const [id, values] of entities)
      console.log(id, values)
    ```
1. **clear,** nukes everything.
    ```ts
    entities.clear()
    ```

### fancy entities methods

1. **select specific entities,** at warp-speed thanks to indexing.
    ```ts
    // only select entities with both 'health' and 'position'
    const selected = entities.select("health", "position")
    ```
    - your game logic systems should be doing a lot of these `select` calls.
1. **save your entities,** as a binary file.
    ```ts
    const file = entities.save()
    ```
1. **load entities,** from a binary file.
    ```ts
    entities.load(file)
    ```
1. **rollback is easier than you think.**
    ```ts
    import {startRollback} from "@benev/archimedes"

    // start your rollback session (it's watching for changes to undo)
    const rollback = startRollback(entities)

    // let a bunch of crap happen
    entities.set(makeId(), {health: 99})
    entities.update(wizardId, {position: [1, 2]})

    // screw that crap, let's revert!
    rollback.revert()
      // now it's like none of that crap ever happened
    ```
    - you can also call `rollback.cancel()` to not rollback (and keep the crap).



<br/><br/>

👼 *https://benev.gg/*

