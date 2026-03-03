import importlib
import traceback

modules = [
    'backend.routes.interview_routes',
    'backend.schemas.request_schema',
]

for m in modules:
    try:
        mod = importlib.import_module(m)
        print(f'IMPORTED {m}:', dir(mod))
    except Exception as e:
        print(f'FAILED {m}:')
        traceback.print_exc()
