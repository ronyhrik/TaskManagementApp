if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/user/.gradle/caches/9.0.0/transforms/06b4b4c0091fb00393c49c59e2014b5d/transformed/hermes-android-0.14.0-debug/prefab/modules/hermesvm/libs/android.x86/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/user/.gradle/caches/9.0.0/transforms/06b4b4c0091fb00393c49c59e2014b5d/transformed/hermes-android-0.14.0-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

