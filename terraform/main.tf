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

resource "docker_container" "backend" {
  name  = "canteen-backend"
  image = "dulanga002/canteen-backend:latest"
  networks_advanced {
    name = docker_network.canteen_network.name
  }
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
}