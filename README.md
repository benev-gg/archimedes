
![](https://i.imgur.com/DYcrs49.png)

# 🌀 archimedes, netlogic for multiplayer web games

> [***"do not disturb my circles!"***](https://en.wikipedia.org/wiki/noli_turbare_circulos_meos!)  
> &nbsp; &nbsp; — *archimedes, c. 212 bc*

```bash
npm install @benev/archimedes
```

- 🧩 [**#ecs,**](#ecs) entities, components, systems.
- 🔮 [**#sim,**](#sim) code like it's single-player, archimedes makes it multiplayer.
- 🌎 [**#net,**](#net) whole-world rollforward, everything is clientside predicted for insta-feels.



<br/><a id="ecs"></a>

## 🧩 ecs — entities, components, systems

```ts
import {Entities, asSystems, makeId, makeExecute} from "@benev/archimedes"
```

1. ***define components.*** json-friendly data that entities could have.
    ```ts
    export type MyComponents = {
      health: number
      bleed: number
    }
    ```
1. ***create entities map.*** indexed for speedy-fast lookups.
    ```ts
    export const entities = new Entities<MyComponents>()
    ```
1. ***define systems.*** select entities by components. entities param is readonly. changes are formalized.
    ```ts
    const systems = asSystems<MyComponents>((entities, change) => [
      function bleeding() {
        for (const [id, components] of entities.select("health", "bleed")) {
          if (components.bleed > 0) {
            const health = components.health - components.bleed
            change.merge(id, {health})
          }
        }
      },

      function death() {
        for (const [id, components] of entities.select("health")) {
          if (components.health <= 0)
            change.delete(id)
        }
      },
    ])
    ```
1. ***manually insert your first entity.***
    ```ts
    const wizardId = makeId()
    entities.set(wizardId, {health: 100, bleed: 2})

    console.log(entities.get(wizardId)?.health)
      // 100
    ```
1. ***simulate the world by making and running execute***
    ```ts
    const execute = makeExecute(entities, systems)

    // simulate one tick
    execute()

    console.log(entities.get(wizardId)?.health)
      // 98
    ```



<br/><a id="sim"></a>

## 🔮 sim — networkable simulation architecture

*coming soon*



<br/><a id="net"></a>

## 🌎 net — connect and run multiplayer games

*coming soon*

