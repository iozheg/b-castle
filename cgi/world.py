import random
import json

from conf import *

class World:
    """Game world.
    
    Generates and holds world params.
    """

    def __init__(self):
        self.terrain = self.generate_terrain()
        self.wind = self.generate_wind()

    def get_world_params(self):
        """Returns tuple of terrain and wind."""
        return (
            self.terrain,
            self.wind
        )

    def get_json_terrain(self):
        """Returns terrain list as JSON."""
        return json.dumps(self.terrain)

    def get_wind_force(self):
        """Returns wind force."""
        return self.wind

    def generate_empty_terrain(self):
        """Returns zero terrain.
        
        Max height of terrain - 0. Used for test purposes.
        """
        width = 1800        
        terrain = [0 for _ in range(width)]
        return terrain

    def generate_max_terrain(self):
        """Return terrain with max values."""

        width = 1800
        height = 700
        terrain = [height for _ in range(width)]
        return terrain

    def generate_terrain(self):
        """Generates and returns terrain list.
        
        For generation terrain we use Midpoint displacement algorithm.
        Terrain is represented by list that holds value of height
        for every vertical line. Algorithm help to generate such
        list.
        Param 'k' is some factor to manipulate terrain view.
        """
        width = 1800
        height = 700
        k = 0.8
        terrain = [0 for _ in range(width)]

        def mdp(res, indexH1, indexH2, k, height):
            """Midpoint displacement algorithm."""            
            length = indexH2 - indexH1
            if (length <= 1):
                return
            index = int((indexH1 + indexH2)/2)
            res[index] = abs(
                round(
                    (res[indexH1] + res[indexH2]) / 2 + rand(-1 * k * length, k * length)
                )
            )
            mdp(res, indexH1, index, k, height)
            mdp(res, index, indexH2, k, height)
            
        terrain[0] = terrain[-1] = 1
        mdp(terrain, 0, width-1, k, height)

        #Normalize values. They must be from 0 to height.
        maxv = 0
        for point in terrain:
            if(maxv < point):
                maxv = point
        if(maxv > height):
            k = height / maxv
            for i in range(width):
                terrain[i] *= k

        #Make terrain "pixelized".
        for i in range(0, width-1, 3):
            terrain[i] = terrain[i+1] = terrain[i+2] = int(terrain[i])
            
        return terrain

    def generate_wind(self):
        """Generates and returns wind force."""
        return round(rand(MINWINDFORCE, MAXWINDFORCE), 1)

    # def get_short_terrain(self):
    #     return self.terrain[::3]

def rand(minv, maxv):
    """Generate random value between minv and maxv."""    
    return random.random() * (maxv - minv) + minv