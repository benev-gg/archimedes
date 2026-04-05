
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
import {Entities, asSystems, change, executeSystems} from "@benev/archimedes"
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
1. ***define systems.*** select entities by components. commit changes.
    ```ts
    // readonly variant so systems behave
    const ents = entities.readonly()

    const systems = asSystems<MyComponents>(
      function bleeding(commit) {
        for (const [id, components] of ents.select("health", "bleed")) {
          if (components.bleed > 0) {
            const health = components.health - components.bleed
            commit(change.merge(id, {health}))
          }
        }
      },

      function death(commit) {
        for (const [id, components] of ents.select("health")) {
          if (components.health <= 0)
            commit(change.delete(id))
        }
      },
    )
    ```
1. ***create your first entity.***
    ```ts
    const wizardId = makeId()
    entities.set(wizardId, {health: 100, bleed: 2})

    console.log(entities.get(wizardId)?.health)
      // 100
    ```
1. ***execute systems to simulate each tick.***
    ```ts
    executeSystems(entities, systems)

    console.log(entities.get(wizardId)?.health)
      // 98
    ```



<br/><a id="sim"></a>

## 🔮 sim — networkable simulation architecture

*coming soon*



<br/><a id="net"></a>

## 🌎 net — connect and run multiplayer games

*coming soon*


