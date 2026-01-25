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
