from conf import *

class World:

    def __init__(self):
        self.terrain = self.generate_terrain()
        self.wind = self.generate_wind()

    def get_world_params(self):
        return (
            self.terrain,
            self.wind
        )

    def generate_terrain(self):
        width = 1800
        height = 700
        k = 0.8
        terrain = [0 for _ in range(width)]

        def mdp(res, indexH1, indexH2, k, height):
            """midpoint displacement. generate terrain line"""
            
            length = indexH2 - indexH1
            if (length <= 1):
                return
            index = int((indexH1 + indexH2)/2)
            res[index] = abs(round((res[indexH1] + res[indexH2]) / 2 + rand(-1 * k * length, k * length)))
            mdp(res, indexH1, index, k, height)
            mdp(res, index, indexH2, k, height)
            
        terrain[0] = terrain[-1] = 1
        mdp(terrain, 0, width-1, k, height)

        #normalize values. they must be from 0 to height
        maxv = 0
        for point in terrain:
            if(maxv < point):
                maxv = point
        if(maxv > height):
            k = height / maxv
            for i in range(width):
                terrain[i] *= k

        #make terrain "pixelized"
        for i in range(0, width-1, 3):
            terrain[i] = terrain[i+1] = terrain[i+2] = int(terrain[i])
            
        return terrain

    def generate_wind():
        return round(rand(MINWINDFORCE, MAXWINDFORCE), 1)

    def get_short_terrain(self):
        return self.terrain[::3]

def rand(minv, maxv):
    """Generate random value between minv and maxv"""
    
    return random.random() * (maxv - minv) + minv