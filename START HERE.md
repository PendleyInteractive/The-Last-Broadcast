# The Last Broadcast

A playable RPG Maker MV psychological-horror campaign prototype.

## Play or edit

In RPG Maker MV, choose **File → Open Project**, then select the `Game.rpgproject` file in this folder. Click the green **Playtest** button to play.

The project uses the assets from your installed RPG Maker MV copy. Keep the whole folder together. No paid plugins or extra downloads are needed.

It also uses the **Horror Soundscapes DLC already present in your MV installation**. No new purchase was made. Credits are available on the title screen.

## Controls

- Arrow keys: move.
- Enter or Z: investigate people, notes, cabinets, and doors.
- Shift: run.
- Esc or X: open the menu or go back.
- Field notes: review your objective and discovered clues.
- Save: use the menu outside pursuit rooms, or interact with a small monitor/recorder.

During a pursuit, reach a cabinet while the enemy is more than three tiles away. Interact to hide, dismiss the message, and wait five seconds. Capture returns you to that room's entrance without deleting your discoveries. Saving is disabled inside the two pursuit rooms.

The pursuer patrols until it sees you along a clear row or column, or hears you running nearby. Walk quietly when you can. Break its line of sight around a corner and stop running: it searches your last known position for four seconds before returning to patrol. Cabinets still provide shelter when you have enough distance.

## Included

16 connected maps, 77 editable events, Mara as the protagonist, June's cassette, Mrs Bell's disappearance, school and hospital investigations, floodgate controls, three memory anchors, a confrontation with Thomas, two pursuit rooms, and three ending choices.

The ending choices are all available at the transmitter. Save there to see each ending.

## Current scope

### Horror presentation update

The game now uses lighting centered on Mara, deeper shadows in pursuit rooms, a stock MV hooded pursuer, quiet apparitions, radio interference, changing photographs, disturbing room clues, and staggered corridor walls. Ash Street uses exterior tiles. The survivors' refuge stays calmer and brighter.

Nine tracks from the installed Horror Soundscapes library provide distinct nighttime, rain, school, hospital, tunnel, altered-house, station, and archive ambience. A heartbeat soundscape starts during an active chase. Hiding quiets the ambience, and dialogue lowers it so reading has breathing room. Stock MV effects provide knocks, doors, radio noise, and quiet running footsteps.

**No AI-generated artwork or audio is included.** See `ARTWORK POLICY.md` for the asset policy. The generated creature and earlier synthesized audio were removed from the playable project.

Choose **Options → Reduced effects** to disable visual interference and apparitions. Text captions remain available. Set SE or BGS volume in Options to adjust sound intensity.

Close and restart the playtest to load the update. If the project was already open in MV while these files changed, reopen it before editing; do not save an old editor view over the changed maps. Back up any edits you made separately before reopening.

This is a compact, complete-route prototype, **not a finished 20-hour game**. Playtime has not been measured with independent players. Graphics use stock assets, rooms are deliberately simple, and recordings are captioned text with ambient sound rather than voice acting.

To reach the planned 20-hour campaign, the chapters need larger, distinct locations, additional character stories and puzzles, more varied encounters, dedicated horror artwork, and repeated outside playtesting. The current project establishes the story route and working systems for that expansion.

## Verified

- Title and opening load in the installed MV game runtime without errors.
- All 16 maps' interactive events are reachable from their test entry point.
- Incorrect puzzle answers remain locked; correct answers progress.
- All three ending branches execute.
- Story flags and journal entries survive MV save-data serialization.
- Menu and journal open; hiding prevents movement and ends correctly.
- Close-range hiding is refused; capture resets both player and enemy.
- All nine imported horror tracks load with their loop metadata in MV.
- Chase, hiding, and dialogue audio changes work; credits open from the title screen.

These checks do not replace a complete human playthrough or establish the final game's duration.
