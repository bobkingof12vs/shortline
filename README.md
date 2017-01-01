# shortline
Railroad Simulator


Load a new game: http://184.101.40.47/shrtln/main.php

Load an example:  http://184.101.40.47/shrtln/main.php?id=91


Read this first!

First, take simulator lightly... I am not sure how else to describe it :- /

Second, this is hosted on my home server. Meaning my IP address may change from time to time. Check here for a new link if your link dies.

Third, remember this is game is in alpha. So it will have bugs, and gameplay is incomplete. But a number of features still work.


Finally, How to play the game. 

There are a few tools in the menu on the top left. Here is a brief description of how to use each

1. Run Trains 

  This will run your trains and give you a menu to control individual trains speeds
  
  Click the red blocks next to the switches to change their tracks.
  
  Note, the game may crash if you do not have track or trains before you press this button...
  
2. Terraform Tools

  2.1. Raise Ground
  
    - Gives a point and click ability to raise the ground based on closest point. Currently there are no limits to this.

  2.2. Lower Ground
  
    - Gives a point and click ability to lower the ground based on closest point. Currently there are no limits to this.

  2.3. Lower Ground
  
    - Gives a point and click ability to flatten the clicked tile to the average of the 4 height points.
  
  2.4. Recolor Ground
    - Allows you to recolor a tile
    
3. Add Track
  Lets you build track by clicking around.
  
  A click close to an existing point will snap to that existing point.
  
  All connecting points will work, meaning switches are automatically created.
  
  Trial and error may be necessary here.
  
  One bug... switches need to have 2 points between them (not including the switch points). If you do not have 2 points between them, the trains will do odd things
  
4. Add Trains
  
  This will ask you to pick an engine first, followed by as many railcars as you would like.
  
  The game may have errors if you add the train before you create track.
  
5. Add Buildings
  
  Once you click the image in the box on the bottom right, the building will follow your mouse. 
  
  There is a limited ability to reposition the building by clicking it again and moving it. This goes away once your click any menu option.
  
  There are a number of quirks with this process, so a little trial and error again here is needed to get it right.
  
6. Add Trees

  6.1. One Tree
  
    - This will add one tree specifically at the point you mouse clicks
  
  6.2. Five Trees
  
    - This will add fives trees randomly in a 2 tile wide radius around your mouse.
    
7. Add Roads

    This works the same as laying railroad tracks. Except it isn't used for anything other than decoration... maybe one day :)
  
8. Halt Program

  Dev Tool. Forces the game loop to skip all functions until this option is unclicked again
  
9. Save Game

  Asks for an email address (for an eventual "recover your saves" kind of option), then saves your game, then gives you an id
  
  Save This ID!
  
  to load the save, you need to go to this link, adding your id at the end the link (ie. ..main.php?id=1234)
  
  http://184.101.40.47/shrtln/main.php?id=
