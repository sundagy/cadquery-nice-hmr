from cadquery import Workplane, exporters
import trimesh

# Основной блок
base = Workplane("XY").box(60, 40, 10)

# Сквозное отверстие (на верхней грани)
base = base.faces(">Z").workplane().hole(10)

# Вертикальная стенка
wall = Workplane("XY").center(0, -15).box(60, 2, 20).translate((0, 0, 10))

# Ребра
ribs = (
    Workplane("XY")
    .pushPoints([(-25, -20), (25, -20)])
    .box(2, 10, 15)
    .translate((0, 0, 10))
)

# Объединение
model = base.union(wall).union(ribs)


# Фаски
model = (model.edges("|X or |Y or |Z").chamfer(0.2))


exporters.export(model, "model.stl")

# Экспорт в .glb
mesh = trimesh.load("model.stl")
mesh.export("model-app/public/model.glb")
