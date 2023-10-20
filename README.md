[![Setup Script Test](https://github.com/chrisl8/PanicStations/actions/workflows/setup.yml/badge.svg)](https://github.com/chrisl8/PanicStations/actions/workflows/setup.yml)

# Panic Stations
![Image of Pantic Stations Game](PanicStations.jpg "Panic Stations Game")  
![Image of Pantic Stations Game Reverse Side](PanicStationsReverseSide.jpg "Panic Stations Game Reverse Side")

This is the code for our Two Player Coop Panel project. It is based on the "Push The Button" game built and coded for the 2018 Winter ICT Game Jam. That code can be seen at the [ictGameJamWinter2018](https://github.com/chrisl8/ictGameJamWinter2018) repository.

# Description

This game is a physical game, in that it is built with an Arduino and lots of buttons and switches.
You won't really be able to play it without building something.

This game is inspired by the mobile game SpaceTeam.

For my panel this code runs on a Raspberry Pi, although it works just as well on a PC. The Pi just allows me to make the project self contained.

## Raspberry Pi Setup

This is intended to run on a Raspberry Pi running **Raspbian** Lite. As of this writing I am using Raspberry Pi OS (32-bit) based on Debian **Bullseye**. Newer or older versions may or may not work without modification.

I have used both a Pi 3 and a Pi 4 without issue. This code does tend to create high CPU load on one core, so the faster Pi 4 probably helps, especially if you have many "stations" in your game. For just two stations a Pi 3 is fine though.

_Running the 64-bit version will not provide any benefit, and may leave you with less available memory._

Put a fresh copy of Raspbian (RASPBERRY PI OS LITE 32-BIT) on your Raspberry Pi then run the installation script below.

You can now do things like enable SSH, set host name, configure WiFi, etc. within the Raspberry Pi Imager, which will make it easier to get started without connecting a monitor to the Pi, although watching the first boot can be easier than anxiously waiting to see if it booted or not.

**If you did not set your username and such in the Raspberry Pi Imager** you will probably need to connect a monitor to your Pi and follow the on screen setup instructions to get the OS fully set up and working, including connecting it to your network for installation of this code. Remember to plug your monitor into HDMI port **0**!

#### SSH Remote Access to Pi
**IF you did not already do this during the imaging process:**  

Raspbian has the SSH Server disabled by default. Follow their instructions to [enable the SSH server on your Raspberry Pi](https://www.raspberrypi.com/documentation/computers/remote-access.html#enabling-the-server) if you want to do this remotely rather than from the pi itself.

Copied here for convenience:
 - Run `sudo raspi-config`
 - Select `Interfacing Options`
 - Navigate to and select `SSH`
 - Choose `Yes`
 - Select `OK`
 - Choose `Finish`

#### WiFi
**IF you did not already do this during the imaging process:**

If you want to set up your Pi to work over WiFi, use the same `sudo raspi-config` menu.  
It is under `System Options`

### Pi Serial Port Enable
You **must** enable the serial port on the Pi before running the install script below.

Follow the [instructions to enable Serial port on Pi](https://serialport.io/docs/guide-installation#raspberry-pi-linux).

Copied here for convenience:  
Copied here for convenience:
- Run `sudo raspi-config`
- Select `Interfacing Options`
- Navigate to and select `Serial Port`
- Choose `No` for "Would you like a login shell to be accessible over serial?"
- Choose `Yes` for "Would you like the serial port hardware to be enabled?"
- Select `OK`
- Choose `Finish`
- Choose `Yes` for "Would you like to reboot now?"

## Install this Code
There is a script to install everything. Run:

```
bash <(wget -qO- --no-cache -o /dev/null https://raw.githubusercontent.com/chrisl8/PanicStations/main/setup.sh)
```

**A reboot will be required after the first install, but you probably want to put in a settings.json5 file first. See below.**

**NOTICE: If your LCD Displays are brand new, some settings will be saved to them on first run that will not take affect until they are power cycled once. So you may need to power them down by unplugging them from USB or powering off the Pi at least once after the first run before they will display correctly.**

## Setup

There must be a `settings.json5` file in the root of the folder for this code to work.  
You can find example files in the `exampleSettings` folder.  
Copy on in before attempting to run this code.

## Running the game

If you ran the setup script, and provided a `settings.json5` file, then it should all be working after your first reboot.  
There are shell scripts to stop, start, restart, and view the log.

## Hardware Setup

### Arduino
The code itself is [Johnny-Five](http://johnny-five.io/) based, and requires one or more Arduino boards with the correct firmata installed to read the button input, write the LED input, and communicate with this code running on your PC or Pi.

#### Installing Firmata on Arduino
1. Download and Install the latest Arduino IDE for your OS from [Arduino Software](https://www.arduino.cc/en/software)
2. Get the Firmata package by:
   3. Open the Arduino IDE
   4. Select the _Tools_ menu.
   5. Select _Manage Libraries..._
   6. Type `Firmata` into the search box.
   7. Find the entry called `Firmata by Firmata Developers` and click _Install_ on it
8. Open the StandardFirmataPlus file by:
   9. Select the _File_ menu.
   10. Select _Examples_
   11. Select _Firmata_
   12. Select _StandardFirmataPlus_
       13. This will open up the StandardFirmataPlus.ino file
14. Install the StandardFirmataPlus by:
    15. Plug your Arduino board into the USB port on your computer
    16. Select it in the dropdown near the top of the IDE
    17. Select _Sketch_ -> _Upload_ or use the Upload button in the IDE

This should upload the Standard Firmata Plus to your Arduino. From now on you won't need to use the Arduino IDE anymore or really think about the Arduino board's software. The [Johnny-Five](http://johnny-five.io/) library within the Node.js application will talk "through" the Arduino to the various components you connect to it. The Arduino has essentially become a peripheral for use by your Node.js code.

#### 4-Digit 7-Segment Display with Adafruit HT16K33 Backpack
Hardware Link: https://www.adafruit.com/product/1002  
Instructions: https://learn.adafruit.com/adafruit-led-backpack/0-dot-56-seven-segment-backpack-assembly  

##### Pins
 - `+` VCC 5 volts
 - `-` GROUND
 - `SDA` "SDA" Pin on Arduino
 - `SCL` "SCL" Pin on Arduino

##### Testing 

Use the `node/testHardware/testDigitalReadout.js` script to test it and learn how to use it.

### Hardware Notes

#### Arduino Pins
https://www.arduino.cc/reference/en/language/functions/communication/serial/  
Pins 0 and 1 are connected to the USB Serial device, so they **cannot** be used with this code.  
Do not plug anything into pins 0 and 1.

https://www.arduino.cc/reference/en/language/functions/analog-io/analogwrite/  
Online Pins 2-13 & 44-46 can be used for "isAnode: true" LEDs. (15 pins),  
although other pins can be used for "regular" LEDs.

#### Potentiometers
Potentiometers must be powered with FIVE volts from Arduino, not the 3.3v line.

#### Using Analog pins as Digital on Arduino with Johnny-Five
To use Analog pins as Digital, use a number by adding the next pin up (54) to the A number.

### Version 1.0 Improvements:
* Better box with fancy metallic looking paint.
* Character Displays on board, so you don't have to look up at a monitor/TV to get your directions.
* 10 buttons per side instead of 5
* 11 switches per side instead of 5
* More "randomized" pattern for layout
* Lots of playability improvements in the code, but the game play logic is still the same.
    * Positive "SUCCESS" confirmation when you perform your task before your teammate does.
    * Knobs register when they leave the correct zone before your teammate performs their command

### Plan
1. Create a minimal "game" first consisting of simply:
   2. One button, then
      3. The "push" command must be on screen if there is no LED.
      4. Should there be an option for "use console for direction" vs. "use screen for debug output"?
   3. One button, and one LED, then
   4. One button, and one LED, and one LCD screen.
5. Convert the setup files to be JSON5 and all in one file.
6. Create an example for:
   7. Each of the options above, and make it work.
   8. The Panic Stations, and make it work.
   9. TARDIS Console (initially with ONE panel).
10. Make all 3 above work both from CLI and PM2 on both Linux and Windows.
11. Write up instructions for each, especially for a user to use this code with One Button.
10. Add the "Options" input switch.
11. Define a "Start" button.
12. Change game to allow starting with <all stations armed
13. ... see below for more ideas and decide what to do next...

### Future Enhancements/TODO
* Ability to "start" game with fewer than all panels armed.
  * Starting with just ONE panel armed should allow a single player game.
* Lights on the switches and the knobs
    * That is what the extra holes are for.
* ~~Volume control~~
  * Test this, as it seems unreliable
* Improved text and "interactivity" from system as you do things.
* String of lights along the side to indicate progress/score/etc.
* Alternate game modes
    * Self-driven Demo mode that just flashes lights
    * User driven demo mode where it just makes sounds and flashes lights when you push buttons and turn knobs.
    * Use lights to "signal" which thing to switch when time runs short.
    * Mode with no commands, just lights to say "push this"
    * Single player mode
    * Competitive mode
* Add pre-game menu options:
    * Set easy/normal/hard difficultly.
* Set "mode" for things like:
    * Competitive mode
    * Coop mode
    * Not game, just push buttons for noise and lights.
    * "DEMO" Mode where it just makes lights
    * "ENDLESS" mode where the game never ends, you just keep doing the next thing (no timer or failure doesn't count against you)
* Adjust screen brightness and contrast (should reset to default on reboot/power cycle)
* Option to "Swap" LCD displays (and save port) if they are wrong.

# Multiplayer Design Thoughts

## Definition Notes

I am attempting to use the word "Round" instead of "Game" to refer to a specific "round of the game", to avoid confusion with the general "game" itself. i.e. "We play a ROUND of Monopoly." helps make it clear when we are referring to how a specific Round went vs. how the Game itself operates in general. However, I will probably say "game" a lot of time when I really intended to say "round".

## Concepts
 - Console - A physical or virtual device where the game is played. Each console can have as many or few stations on it as desired.
   - A "console" with zero stations would in theory just be a display of some kind, showing game status, no actual stations. See Ownership and Physical vs. Virtual Stations later.
 - Station - A physical or virtual instance of input on the console where a player plays their game.
   - There may be any number of stations on one console.
 - Round - An instance of a round of play. In any given game, many variables may be different from another game.
   - For instance
     - Which Stations are operating can change from Round to round
     - Game Mode can change from round to round.
     - The Station Owner could change from round to round.
     - Even the Round Owner could change from round to round.
 - Session - A "session" is what one or more consoles may connect to on a server in order to share together in one group "game" and share their station and game data.
 - Server - When more than one console is involved, a server is required to receive and distribute all station data.
   - The server does not perform any processing on the data it receives, it simply passes it on.
 - Ownership - Ownership applies to the entire Game and to each Station
   - The Round Owner runs the "game loop":
     - Tracking the score.
     - Decides if an input was correct.
     - Deciding when a player has succeeded or failed.
     - Ending the round.
     - The Round Owner will be elected and either be:
       - If the Console's UUID is listed as "Round Owner" on the server, it will always be the Round Owner
       - Otherwise the Full Console Type with the MOST Stations will always be the Round Owner
   - The Station Owner tracks all user input to the given station and records it in the Station Data, sending it to the Server when there are updates.
     - Does not determine success particularly, but because it controls the local station, it must do things like play sounds and light up LEDs locally as it sees fit, based on both general game design decisions and rules specific to this Game. 
 - Station Data - A representation of all aspects of a given station that is only updated by the Station Owning Console.
 - Round Data - A representation of the Round itself that is only updated by the Round Owning Console.
 - Game Loop - Each Console runs code that has a Game Loop just like most games. Nothing fancy here, just know that the processing of inputs and game logic does happen in a Game Loop so there are the usual order of operation and "batching" issues that go with this. i.e.
   - Two inputs may be seen on the same loop or on different loops and this will affect game logic and should be considered when coding.
 - Overlap or Overlapping Station - Two or more stations on different Consoles with the same UUID. Only one Console can ever update the Station Data for such a station, but as many other Consoles as want to may "mirror" the input of those Stations or ignore it and leave their instance of the Station dark.
   - Which Console Owns a station during a given Round can change from Round to Round, perhaps based on which instance is Armed first?
     - Be sure to indicate to the player somehow whether they are in Control or not.
 - Console Type - There will be Types of Consoles to help determine who does what. Other types could be added, but only do so if it affects who the Server or other Clients treat them. At the moment the only issues is deciding which Client will be a Round Owner Currently planned Console Types are:
   - Full - This is a full on Console with one or more Stations that can run the entire game by itself stand-alone if need be.
     - The key takeaway is that it can be a Round Owner.
     - For now this will be Node.js based Clients.
   - Stations Only - This is a client that has Stations, but cannot run the game logic itself, so it will never be a Round Owner.
     - For now this is expected to be Unity based clients and maybe eventually Web based as well.

## Physical and Virtual Stations and Overlap
A console can exist as a physical device or in a virtual setting such as a VR game instance of a console, and that console will have stations.

Stations can either be unique or overlap, the primary purpose here being that you can have an entire duplicate of a physical console in a VR setting. This is not limited to that setup though, as you could also overlap two physical consoles.

Each station has a UUID ID. If the same UUID exists on two stations within the same Session, then one is expected to "mirror" the other.  
The Console which Owns that station will be the only one that updates and broadcasts updates for that station.
Other consoles will simply update whatever view of the station they can or want to upon receiving data for that station.
i.e. A VR instance can show when other players press buttons or flip switches, however a physical console cannot flip its switches when a VR version inputs a switch flip.  
Consoles with stations that they do not own must not update the data for their stations, even if inputs change locally, they must be ignored.

## Client/Server Operation
 - Each Client will send each OWNED Station Data to the Server at the end of the Game Loop.
   - i.e. Don't send it on EVERY update as you might get 5 in one loop, but definitely do send whatever you have on each loop IF it changed.
   - Clients are responsible to not spam the server with Station Data packets containing no changes, as the server won't look at them.
     - Code could be written to spot spamming clients from other clients and notify the developer of a code issue.
   - Clients will NEVER send data about Stations which they do not Own.
 - The Console which Owns the Round will also send out the Round Data so that all Consoles can update their displays wit things like
   - Score
   - Game over
   - etc.
     - Again, the server should avoid sending such updates unless there is a change.
 - The Server will always simply forward each received packet to all clients OTHER than the one which sent it.
   - This is a built in and default feature of Socket.io, so it is easy to do.
 - Each Client MUST IGNORE any Station Data for stations it Owns. This SHOULD NEVER HAPPEN, but just in case, the safe action is to just ignore such data.
   - Similarly the Round Owner will ignore Round Data if it is received.
   - It would probably be smart to log errors to the console if this happens, to help catch development bugs.

## Session Thoughts
A "Session" is what exists across the network when even one Console connects to the Server.  
In theory many different Sessions can exist at once. i.e. Four consoles may be talking to the server, but that could be two sets of two sessions, with two different Rounds being played.  

So when a Client connects to the Server some things must happen:
 - If no Session(s) exist, one must be created. The Server will use the Session to decide who the updates from a given Client are passed to (again, in case of multiple Sessions).
   - If Session(s) do exist, how do we decide IF this Client is added to one or starts a new one and if it gets added WHICH one to add it to?
 - Which Client will be the Owner of the Rounds for a given Session?
   - Can this change between Rounds?

## Configuration Settings
 - Each Console must have its own `settings` file.
 - Each Console must define its OWN UUID within those settings, hence the file will not be the same between consoles.
   - If two Consoles attempt to connect to the same Server with the same UUID there should be an error reported and the new connection(s) rejected.
 - Each Station must also have its own UUID in the settings.
   - If two Consoles both have stations that are supposed to Overlap then they can have the same UUID.
     - Even in this situation, only ONE Console may Own that Station during a Round.
     - Other Consoles must simply listen to the Station Data for that Station and use the data as they please. i.e. Mirror the inputs to their viewers.

## Explanations

- There will be a Panic Coordination Server that receives and distributes game data to all games
  - This will be run in the cloud, but it should be possible to run it locally instead, which might be preferable for using multiple networked stations all in one location, rather than adding the Internet latency to devices that are otherwise already on the same network.
  - To start with the server will be hard coded, but we can work on ways to "pick" a server and "invite" clients to a given session on a given server.
- There will be the concept of both a
   - GAME Owner
   - STATION Owner
 - The Game Owner will look at the station data from ALL stations and
   - Update score
   - Declare winners and timeouts
   - **This does mean that the physical device that owns the game provides its players with some benefits** due to network latency making everyone else slower
     - It might be possible to track and account for network latency to some degree, but mostly highly time dependent competitive modes should not be played over slow networks. 
 - Each Station is entirely controlled by the client that owns it.
   - Only this Station will update the station object for this station.
   - WHEN this station updates said object, it will send it to the coordination server.
   - **This means each station is responsible for its own internal station behaviors, such as**
     - Lighting up LEDs for various situations
       - When the input is in a specific configuration (on/correct/etc)
       - If hints are to be given, the station must do this.
       - etc.

## Server Setup

 - Every Console has a UUID. This is set in the settings config file.
   - On hardware consoles it should be possible to display this UUID so it can be copied down.
   - On software consoles, this may need to be generated securely on first run and then displayable.
   - It should also be possible to INPUT this to a Console, both hardware (connect, edit file) and software
 - The Server will have a site where you can create an account.
 - After creating the account you may create a "Session"
   - This will again be UUID backed but have "Friendly Name" that can be changed and will be displayed on Consoles upon connection.
 - Once you make a session you will be allowed to type/paste in UUIDs to be part of this session,
   - You will also be able to generate UUIDs on the site and then you can use it to set/replace the UUID on your Console
 - Now any Console with that UUID set which connects to the server will be part of that Session.

To split your own Consoles into different games, make more Sessions on the site and move your UUIDs around.

Any console connecting with an unknown UUID will simply be rejected.

 - Future Feature: Allow setting a specific UUID to be the Owner of all Rounds played in that Session if it is in the Session at the time.

## FAQ
 - Why doesn't the Server run the game logic and just let the Clients pass in data?
   - We COULD do this, but I wanted to ensure that low-latency game play always happened for people centered around a multi-Station Console. It would be annoying if five people on one Console found the game laggy just because one person was remote, but if the one person's game is lagging, people won't notice as much.
   - The solution here would be to put the Server ON the Client I think, and I even want to do that anyway to allow local multi-player without Internet latency, but at least for now I think I want the largest physical Console to just run the game internally and "bolt on" the networked Station data.
   - To be fair, this is also the natural evolution of the existing code base. Moving everything to a Client/Server model would be a big step and should happen later if it is to happen.
     - I will add that my other game, Witchazzan, works on the premise of distributed objects, each entirely owned and controlled by clients, and I kind of want to continue that.

## MVP

Initially just set up the server to accept any connection and put every connection into the same "Session" (in other words, don't even have sessions).

## Config file setup
### Port names and strings
List all of the USB devices:
`lsusb`
```shell
lsusb
Bus 002 Device 004: ID 045b:0210 Hitachi, Ltd
Bus 002 Device 003: ID 045b:0210 Hitachi, Ltd
Bus 002 Device 002: ID 045b:0210 Hitachi, Ltd
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 009: ID 2341:0042 Arduino SA Mega 2560 R3 (CDC ACM)
Bus 001 Device 007: ID 239a:0001 Adafruit CDC Bootloader
Bus 001 Device 005: ID 2341:0242 Arduino SA Genuino Mega 2560
Bus 001 Device 008: ID 239a:0001 Adafruit CDC Bootloader
Bus 001 Device 010: ID 03f0:0024 HP, Inc KU-0316 Keyboard
Bus 001 Device 006: ID 045b:0209 Hitachi, Ltd
Bus 001 Device 004: ID 045b:0209 Hitachi, Ltd
Bus 001 Device 003: ID 045b:0209 Hitachi, Ltd
Bus 001 Device 002: ID 2109:3431 VIA Labs, Inc. Hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

