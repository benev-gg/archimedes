
![](https://i.imgur.com/mKSNcTS.png)

# 🌀 archimedes, architecture for web games

> [***"do not disturb my circles!"***](https://en.wikipedia.org/wiki/noli_turbare_circulos_meos!)  
> &nbsp; &nbsp; — *archimedes, c. 212 bc*

```bash
npm install @benev/archimedes
```

**archimedes is an ecs toolkit.**  
entities feel like ordinary javascript objects.  
but underneath, archimedes is tightly packing bytes into contiguous memory blocks.  
*easy ergonomics. compact storage. efficient networking. strong ts types.*  

**built for where games get complicated.**  
designed for multithreading, serialization, and rollback networking.  

**not a rendering engine.**  
archimedes helps structure your game simulation, but you bring your own renderer. try [babylon lite.](https://www.babylonjs.com/lite/)  

- 🎮 ***[#simple,](#simple)*** **game example**
- 👾 ***[#entities,](#entities)*** **things in your game**
- 🧩 ***[#components,](#components)*** **properties your entities can have**
- ⚙️ ***[#systems,](#systems)*** **game logic**



<br/><a id="simple"></a>

## 🎮 simple, game example

```ts
import {Entities, i8, vec2, makeId, gameloop} from "@benev/archimedes"
```

1. **entities and components.**
    ```ts
    const entities = new Entities({
      health: i8,
      position: vec2,
    })
    ```
1. **create your first entity.**
    ```ts
    const id = entities.set(makeId(), {
      health: 100,
      position: [1, 2],
    })
    ```
    (here's how you'd read it later)
    ```ts
    entities.get(id)
      // {health: 100, position: [1, 2]}
    ```
1. **write some game logic.**
    ```ts
    function simulate() {

      // hazards deal damage
      for (const [id, entity] of entities.select("health", "position")) {
        if (entity.position[1] < 0)
          entities.update(id, {health: entity.health - 1})
      }

      // dead things disappear
      for (const [id, entity] of entities.select("health"))
        if (entity.health <= 0)
          entities.delete(id)
    }
    ```
1. **start the simulation at 60 hertz.**
    ```ts
    gameloop(60, simulate)
    ```



<br/><a id="entities"></a>

## 👾 entities, things in your game

```ts
import {Entities, makeId} from "@benev/archimedes"
```

this entities class is the bread and butter of archimedes.  
it's a robust and flexible primitive that you can build a whole damn game around. it's ergonomic, efficient, and easily synced across network or web worker boundaries.

it looks and feels a lot like a normal js map *(but it's secretly not, tee hee!)*

- **new Entities,** establish your entities.
    ```ts
    const entities = new Entities(components)
    ```
- **entities.set,** create a new entity (or overwrite one).
    ```ts
    // create an entity
    const id = entities.set(makeId(), {
      health: 100,
      position: [1, 2, 3],
    })
    ```
    - `makeId()` creates random 128-bit ids. provide parameters to make a deterministic hash id instead, which is better for multiplayer clientside prediction. `makeId(playerId, "arrow", arrowCount)`
- **entities.get,** obtain an entity's values.
    ```ts
    entities.get(id)
      // {health: 100, position: [1, 2, 3]}
    ```
    - entity values are always typescript readonly.
    - even if you ignore the typescript rules, the entity object is a snapshot, mutation has no effect.
- **entities.update,** apply a partial patch.
    ```ts
    entities.update(id, {health: 99})
      // only update health value
    ```
    ```ts
    entities.update(id, {color: undefined})
      // undefined means "deletes the value"
    ```
- **entities.delete,** destroy an entity.
    ```ts
    entities.delete(id)
    ```
- **entities.clear,** nukes everything.
    ```ts
    entities.clear()
    ```
- **iterate.** (.keys(), .values(), .entries(), etc)
    ```ts
    for (const [id, values] of entities)
      console.log(id, values)
    ```

entities has some more fancy tricks up its sleeve.

- **entities.select,** get entities based on what values they have.
    ```ts
    // only select entities with both 'health' and 'position'
    const selected = entities.select("health", "position")
    ```
    - your game logic systems should be doing a lot of these select calls.
    - select calls are optimized with indexes.
- **entities.save,** get a binary file.
    ```ts
    const file = entities.save()
    ```
- **entities.load,** overwrite with a binary file.
    ```ts
    entities.load(file)
    ```
- **entities.version,** a hash of the component schema.
    ```ts
    entities.version
      // "ecf61ff8d547e6b06c4af5188e6c6cc7"
    ```
    - this version changes if your component schema changes at all.
    - this will hard-break compatibility with old saves and networking.
    - it's up to you to be careful about that, and plan for migrations.
- **entities.readonly,** i use this so much actually.
    ```ts
    setupMyRenderer(entities.readonly)
    ```
    - it's just a different typescript type (for the same object) that doesn't have set/update/etc.
    - i love to pass this around to systems that shouldn't be meddling with my simulation (like a renderer).
- **entities.startRecordingChanges,** for recording changes.
    ```ts
    // start a recording (it listens for changes)
    const recording = entities.startRecordingChanges()

    // let changes happen
    const id = makeId()
    entities.set(id, {health: 99})
    entities.update(id, {position: [1, 2]})

    // get Uint8Array of changes (and stop listening)
    const changes = recording.done()
    ```
    ```ts
    recording.cancel()
      // stop listening and discard the changes
    ```
    ```ts
    // elsewhere on a remote copy of entities...
    entities.applyChanges(changes)
    ```
- **entities.startRecordingRollback,** it's easier than you think.
    ```ts
    // start your rollback session (it listens for changes)
    const rollback = entities.startRecordingRollback()

    // let a bunch of crap happen
    const id = makeId()
    entities.set(id, {health: 99})
    entities.update(id, {position: [1, 2]})

    // screw that crap, let's revert! (and stop listening)
    rollback.execute()
      // now it's like none of that crap ever happened
    ```
    ```ts
    rollback.cancel()
      // stop listening and discard the rollback
    ```



<br/><a id="components"></a>

## 🧩 components, properties your entities can have

```ts
import {asComponents, bool, u8, i16, vec3, f32, tuple, bytes, json} from "@benev/archimedes"
```

- **components tell archimedes how to store your entity data.**  
    ```ts
    const components = asComponents({
      alive: bool,
      level: u8,
      health: i16,
      color: vec3,
      position: tuple(f32, f32, f32), // same as vec3
      avatar: bytes(), // variable-sized Uint8Array
      inventory: json<{items: string[]}>(), // arbitrary json data
    })
    ```
- **built-in components:**
    - numbers: (unsigned integers) `u8`, `u16`, `u32` (signed integers) `i8`, `i16`, `i32` (floats) `f32`, `f64` (bigints) `bigi64`, `bigu64`
    - vectors: (f32) `vec2`, `vec3`, `vec4` (f64) `dvec2`, `dvec3`, `dvec4`
    - other: `bool`, `id`
    - variable components: `bytes`, `json`
    - combine components with `tuple(...)`
    - combine variable components with `vtuple(...)`
    - `bytes` and `json` can accept a `version` string which you can bump for schema incompatibilities.
- **define your own components,** with the `asComponent(...)` helper.



<br/><a id="systems"></a>

## ⚙️ systems, game logic

you can really structure your game logic however you like.  
your game logic can just be a looping function that changes entities over time, using `entities.update` etc...  

ecs philosophers like "system" functions, where each function selects entities by the few components they work on.

if you like, archimedes does provide a composable concept of system functions:
- **declare a context that every system should get:**
    ```ts
    type Context = {
      entities: Entities<MyComponents>
      whatever: MyWhatever
    }
    ```
- **here's one formal system fn:**  
    ```ts
    import {asSystem} from "@benev/archimedes"

    const bleeding = asSystem<Context>(context => {
      const {entities} = context

      // this gets called every tick
      return () => {
        for (const [id, values] of entities.select("health", "bleed"))
          entities.update(id, {health: values.health - values.bleed})
      }
    })
    ```
- **consolidate a nested tree of systems:**  
    ```ts
    import {consolidateSystems, lifecycle} from "@benev/archimedes"

    const supersystem = consolidateSystems<Context>({
      movement: {
        walking,
        jumping,
      },
      health: {
        healing,
        bleeding,

        // use `lifecycle` to create a system that watches.
        // great for stateful rendering concepts like 3d meshes etc.
        bleedLogging: context => lifecycle(
          context.entities,
          ["health", "bleed"],
          (id, {health, bleed}) => {
            console.log("bleed started", id, health)
            return {
              tick: ({health}) => console.log("bleed running", health),
              exit: () => console.log("bleed stopped"),
            }
          },
        ),

        potions: {
          fullHealthPotion,
          slowHealingPotion,
        },
      },
      victory: {
        winAtFinishZone,
        winKilledAllEnemies,
      },
    })
    ```
- **now your supersystem, like any system, takes in context and returns a tick fn.**  
    ```ts
    import {gameloop} from "@benev/archimedes"

    gameloop(60, supersystem({
      entities: new Entities(myComponents),
      whatever: new Whatever(),
    }))
    ```



<br/><br/>

👼 *https://benev.gg/*

