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

def make_perimetr():
    # 3-D-путь (Wire)
    path = cq.Workplane().polyline(points)

    # Workplane с двумя прямоугольниками → после consolidateWires на стеке остаётся 1 внешний и 1 внутренний wire
    profile_wp = (
        cq.Workplane("YZ")
        .rect(tube_width, tube_width)                                   # внешний
        .rect(tube_width - 2 * wall_thickness,                          # внутренний
              tube_width - 2 * wall_thickness)
        .consolidateWires()                                             # объединяет контуры
    )

    solid = profile_wp.sweep(path, isFrenet=True)
    return solid

result = make_perimetr()

#result = result.union(cq.Workplane("XY").box(1, 1, 1))

exportModel(result)
