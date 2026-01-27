terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.20.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "canteen_network" {
  name = "canteen_network"
}

resource "docker_volume" "mongo_data" {
  name = "mongo_data"
}

resource "docker_image" "mongo_image" {
  name = "mongo:6"
}

resource "docker_container" "mongo" {
  name  = "canteen-mongo"
  image = docker_image.mongo_image.name

  volumes {
    volume_name   = docker_volume.mongo_data.name
    container_path = "/data/db"
  }

  networks_advanced {
    name = docker_network.canteen_network.name
  }

  env = [
    "MONGO_INITDB_DATABASE=canteen"
  ]
}

resource "docker_container" "backend" {
  name  = "canteen-backend"
  image = "dulanga002/canteen-backend:latest"

  networks_advanced {
    name = docker_network.canteen_network.name
  }

  env = [
    "MONGO_URI=mongodb://canteen-mongo:27017/canteen",
    "PORT=5000"
  ]

  depends_on = [docker_container.mongo]

  ports {
    internal = 5000
    external = 5000
  }
}

resource "docker_container" "frontend" {
  name  = "canteen-frontend"
  image = "dulanga002/canteen-frontend:latest"

  networks_advanced {
    name = docker_network.canteen_network.name
  }

  ports {
    internal = 5173
    external = 5173
  }

  depends_on = [docker_container.backend]
}
