
![](https://i.imgur.com/JNCvW1J.png)

# 🏛️ Archimedes

> [***"Do not disturb my circles!"***](https://en.wikipedia.org/wiki/Noli_turbare_circulos_meos!)  
> &nbsp; &nbsp; — *Archimedes, c. 212 BC*  

## Tournament-grade rollforward netcode for web games

🔮 **Whole-world rollforward:**  
Player inputs feel instant, and mispredictions correct themselves. It's all automatic, so you don't even have to think about lag when you're coding your game's logic.

🚚 **Transport-agnostic:**  
Default to free player-hosted games via [Sparrow RTC](https://github.com/benevolent-games/sparrow), but you can swap in webtransport or websockets if you want.

⛵ **Logic-agnostic:**  
We don't care if your game has fancy-schmancy ECS architecture, or a humble classical setup, whatever: just subclass `Simulator` and it's smooth sailing.

🛟 **Seamless reconnects:**  
Users *will* accidentally close their browser tab mid-game. Archimedes helps them pick up where they left off, no harm, no foul.

📦 **Npm package `@benev/archimedes`:**  
Archimedes isn't finished yet, it's under active development.

<br/>

# 🤯 Eureka

> [***"Eureka! I have found it!"***](https://en.wikipedia.org/wiki/Eureka_%28word%29)  
> &nbsp; &nbsp; — *Archimedes, sometime before 212 BC*  

## An elegant ECS framework

*Eureka* is an Entity-Component-System framework. It was designed alongside Archimedes, and it's the easiest way to get into Archimedes without making a custom Simulator integration. Eureka can be used without Archimedes, and Archimedes can be used without Eureka — but when they're together, it's *a vibe.*

### Eureka quick setup

- Define your context.
  ```ts
  // All your systems will have access to this.
  export class MyContext {}
  ```
- Declare all your components.
  ```ts
  // Each component can be any serializable data.
  export type MyComponents = {
    health: number
    bleeding: number
    mana: number
    manaRegen: number
  }
  ```
- Setup the Eureka helper.  
  It has your context and component types baked-in.  
  ```ts
  import {setupEureka} from "@benev/archimedes"

  export const eureka = setupEureka<MyContext, MyComponents>()
  ```
- Create the world, and declare your systems.  
  Each system selects entities by their components, and runs behaviors on them.  
  ```ts
  // Instance your context.
  const context = new MyContext()

  // Create the world, providing context and an array of systems.
  const world = eureka.world(context, [

    // Give the system a friendly name.
    eureka.system("my health system")

      // We select which components this system operates on.
      .select("health").andMaybe("bleeding")

      // Behavior logic for this system.
      .fn((entities, world) => {
        for (const {id, components} of entities) {

          // process bleeding
          if (components.bleeding)
            components.health -= components.bleeding

          // process death
          if (components.health <= 0)
            world.delete(id)
        }
      }),

    eureka.system("mana regeneration")
      .select("mana", "manaRegen")
      .fn((entities, _world) => {
        for (const {components} of entities)
          components.mana += components.manaRegen
      }),
  ])
  ```
  - Systems are executed sequentially, from top to bottom.
  - You can organize your systems into separate files, of course.
  - Please notice that I painstakingly designed all of this for immaculate typescript typings.

### Running a Eureka world that does stuff

Okay, now it's time to put something into the world and watch something happen.

- Add an entity.
  ```ts
	const warrior = world.create({health: 100, bleeding: 1})
  ```
- Execute world systems (one simulation tick).
  ```ts
  world.execute()

  // we see that the bleeding behavior worked.
  warrior.components.health // 99
  ```

### Entity method reference

- `entity.id` — the id number for this entity.
  ```ts
  entity.id // 123
  ```
- `entity.components` — the components object for this entity.
  ```ts
  entity.components.health // 99
  entity.components.bleeding // 1
  ```
  - The components object is a proxy, and setting its properties automatically informs the eureka about the change.
- `entity.write` — manually inform eureka that you've made changes inside the entity's components.
  ```ts
  entity.components.myObject.health += 1 // change inside object, not auto-detected
  entity.write() // manually tell eureka about the change
  ```

### World method reference

Creating and updating entities.
- `world.create` — a new entity.
  ```ts
  const wizard = world.create({health: 100, mana: 50, manaRegen: 1})
  ```
- `world.update` — create or update an entity.
  ```ts
  world.write(wizard.id, {health: 100, mana: 75, manaRegen: 1})
  ```

Getting entities.
- `world.get` — get an entity by id, or return undefined if not present.
  ```ts
  const entity = world.get(id)
  ```
- `world.require` — get an entity by id, or throw an error if not present.
  ```ts
  const entity = world.require(id)
  ```
- `world.all` — iterate over all entities
  ```ts
  for (const entity of world.all)
    console.log(entity.id)
  ```

Removing entities.
- `world.delete` — remove an entity from the world.
  ```ts
  world.delete(id)
  ```
- `world.clear` — remove *everything* from the world.
  ```ts
  world.clear(id)
  ```

Full-world data operations.
- `world.data` — iterate over all entity data.
  ```ts
  const data = [...world.data()]
  ```
- `world.overwrite` — create or update all entities with the provided data.
  ```ts
  const entity = world.overwrite(data)
  ```

