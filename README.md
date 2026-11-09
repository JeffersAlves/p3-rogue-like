# Ricochet Run (p3-rogue-like)

2D platformer rogue-like MVP. Bullets **ricochet** off terrain, living enemies, and corpses. Friendly fire is always on. Death wipes the run.

## Play

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`), then click **Start Run**.

### Controls

| Input | Action |
| --- | --- |
| A / D or ← → | Move |
| W / Space / ↑ | Jump |
| J or mouse click | Shoot |
| Enter | Claim upgrade / continue |
| R | Restart run from zero |

### Build

```bash
npm run build
npm run preview
```

## MVP features

- Move, jump, shoot through 4 rooms
- Bullets bounce on walls/floors (never stop on terrain)
- Bullets damage + ricochet on living enemies; corpses become solid bounce surfaces
- Friendly fire (including your own bullets, after a tiny muzzle grace)
- Rogue-like wipe on death (no meta-progression)
- Weapon upgrades: Extended Mag, Piercing, Hollow Points (stop on enemy), Incendiary (fire trail)
- HUD: HP, ammo, active upgrades, room status

## Stack

React + TypeScript + Vite, canvas renderer (no Phaser dependency).
