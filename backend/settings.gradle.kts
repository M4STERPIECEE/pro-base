pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

rootProject.name = "bda"

include("openapi-client")
project(":openapi-client").projectDir = file("src/main/gen")

