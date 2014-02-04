var pong = {
  "title": "Pong",
  "version": "1.0.0",
  "traits": {
    "Draggable": {
      "parameters": {
        "horizontal": true,
        "vertical": true
      },
      "code": [
        {
          "set": [
            "offset_x",
            0
          ]
        },
        {
          "set": [
            "offset_y",
            0
          ]
        },
        {
          "on_event": {
            "name": "touch_began",
            "parameters": [
              "touch_x",
              "touch_y"
            ],
            "code": [
              {
                "set": [
                  "offset_x",
                  {
                    "-": [
                      {
                        "get": "touch_x"
                      },
                      {
                        "get": "x"
                      }
                    ]
                  }
                ]
              },
              {
                "set": [
                  "offset_y",
                  {
                    "-": [
                      {
                        "get": "touch_y"
                      },
                      {
                        "get": "y"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          "on_event": {
            "name": "touch_moved",
            "parameters": [
              "touch_x",
              "touch_y"
            ],
            "code": [
              {
                "if": {
                  "test": {
                    "==": [
                      {
                        "get": "horizontal"
                      },
                      true
                    ]
                  },
                  "true": [
                    {
                      "set": [
                        "x",
                        {
                          "-": [
                            {
                              "get": "touch_x"
                            },
                            {
                              "get": "offset_x"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              },
              {
                "if": {
                  "test": {
                    "==": [
                      {
                        "get": "vertical"
                      },
                      true
                    ]
                  },
                  "true": [
                    {
                      "set": [
                        "y",
                        {
                          "-": [
                            {
                              "get": "touch_y"
                            },
                            {
                              "get": "offset_y"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  "objects": [
    {
      "id": "paddle1",
      "physics_body": "rectangle",
      "image": {
        "path": "paddle.png"
      },
      "traits": {
        "Draggable": {
          "parameters": {
            "vertical": false
          }
        }
      },
      "properties": {
        "x": 104,
        "y": 44,
        "width": 129,
        "height": 28
      },
      "code": []
    },
    {
      "id": "paddle2",
      "physics_body": "rectangle",
      "image": {
        "path": "paddle.png"
      },
      "traits": {
        "Draggable": {
          "parameters": {
            "vertical": false
          }
        }
      },
      "properties": {
        "x": 224,
        "y": 434,
        "width": 129,
        "height": 28
      },
      "code": []
    },
    {
      "id": "ball",
      "physics_body": "circle",
      "image": {
        "path": "grayball.png"
      },
      "traits": {},
      "properties": {
        "x": 160,
        "y": 240,
        "width": 30,
        "height": 30,
        "bouncy": true
      },
      "code": [
        {
          "on_event": {
            "name": "start",
            "parameters": [],
            "code": [
              {
                "set": [
                  "speed",
                  100
                ]
              },
              {
                "call": {
                  "method": "move",
                  "parameters": [
                    45,
                    {
                      "get": "speed"
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "on_event": {
            "name": "collision",
            "parameters": [
              "other_sprite"
            ],
            "code": [
              {
                "if": {
                  "test": {
                    "or": [
                      {
                        "==": [
                          {
                            "get": "other_sprite"
                          },
                          "paddle1"
                        ]
                      },
                      {
                        "==": [
                          {
                            "get": "other_sprite"
                          },
                          "paddle2"
                        ]
                      }
                    ]
                  },
                  "true": [
                    {
                      "set": [
                        "speed",
                        {
                          "+": [
                            {
                              "get": "speed"
                            },
                            2
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  ]
};
