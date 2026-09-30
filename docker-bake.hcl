target "build" {
  context = "."
  dockerfile = "Dockerfile"
}

target "validate-build" {
  inherits = ["build"]
  call = "check"
}