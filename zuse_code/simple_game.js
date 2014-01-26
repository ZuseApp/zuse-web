var simple_game = {
  "interpreter_version": 1,
  "title": "Guess a Number",
  "objects": [
    {
      "id": "some string",
      "properties": {
        "x": 10,
        "y": 10,
        "width": 100,
        "height": 100
      },
      "code": [
        {
          "on_event": {
            "name": "start",
            "code": [
              {
                "set": [
                  "num",
                  {
                    "call": {
                      "method": "random_number",
                      "parameters": [
                        1,
                        10
                      ]
                    }
                  }
                ]
              },
              {
                "set": [
                  "result",
                  {
                    "call": {
                      "method": "ask",
                      "async": true,
                      "parameters": [
                        "Enter a number between one and ten"
                      ]
                    }
                  }
                ]
              },
              {
                "if": {
                  "test": {
                    "==": [
                      {
                        "get": "num"
                      },
                      {
                        "get": "result"
                      }
                    ]
                  },
                  "true": [
                    {
                      "call": {
                        "method": "display",
                        "parameters": [
                          "Good guess!"
                        ]
                      }
                    }
                  ],
                  "false": [
                    {
                      "call": {
                        "method": "display",
                        "parameters": [
                          "Wrong!"
                        ]
                      }
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
