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
  "collision_groups": {
    "paddle": [
      "ball"
    ],
    "ball": [
      "paddle"
    ]
  },
  "objects": [
    {
      "id": "score",
      "properties": {
        "x": 270,
        "y": 543,
        "width": 100,
        "height": 50,
        "text": "0",
        "score": 0
      },
      "physics_body": "none",
      "collision_group": "text",
      "type": "text",
      "code": [
        {
          "on_event": {
            "name": "score",
            "parameters": [],
            "code": [
              {
                "set": [
                  "score",
                  {
                    "+": [
                      {
                        "get": "score"
                      },
                      1
                    ]
                  }
                ]
              },
              {
                "set": [
                  "text",
                  {
                    "get": "score"
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "id": "paddle1",
      "type": "image",
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
      "collision_group": "paddle",
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
      "type": "image",
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
      "collision_group": "paddle",
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
      "type": "image",
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
      "collision_group": "ball",
      "code": [
        {
          "on_event": {
            "name": "start",
            "parameters": [],
            "code": [
              {
                "set": [
                  "speed",
                  200
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
          "set": [
            "hits left",
            1
          ]
        },
        {
          "on_event": {
            "name": "collision",
            "parameters": [
              "other_sprite"
            ],
            "code": [
              {
                "trigger_event": {
                  "name": "score",
                  "parameters": {}
                }
              }
            ]
          }
        }
      ]
    }
  ]
}; 
