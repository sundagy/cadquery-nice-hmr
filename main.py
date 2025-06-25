from typing import List
import cadquery as cq
from utils import exportModel

# Параметры профиля трубы
tube_width = 0.2       # внешняя ширина трубы
wall_thickness = 0.01    # толщина стенки

# Координаты 4-х точек (замкнутый контур)
points = [
    (0, 0, 0),
    (10, 0, 0),
    (12, 0, 10),
    (0, 0, 10),
    (0, 0, 0)
]

def make_bar(points: List, size: float, thickness: float):
    # 3-D-путь (Wire)
    path = cq.Workplane().polyline(points)

    # Workplane с двумя прямоугольниками → после consolidateWires на стеке остаётся 1 внешний и 1 внутренний wire
    profile_wp = (
        cq.Workplane("YZ")
        .rect(size, size)                                   # внешний
        .rect(size - 2 * thickness,                          # внутренний
              size - 2 * thickness)
        .consolidateWires()                                             # объединяет контуры
    )

    solid = profile_wp.sweep(path, isFrenet=True)
    return solid

result = make_bar(points, tube_width, wall_thickness)

exportModel(result)
