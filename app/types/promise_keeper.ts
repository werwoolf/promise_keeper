/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/promise_keeper.json`.
 */
export type PromiseKeeper = {
  "address": "6cJtEwsgr4jjw6MGqTZcQ2nsZ3YEhyZfrfuqwAfCeoG7",
  "metadata": {
    "name": "promiseKeeper",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createTask",
      "discriminator": [
        194,
        80,
        6,
        180,
        232,
        127,
        48,
        171
      ],
      "accounts": [
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "counter.data",
                "account": "tasksCounter"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "counter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  95,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "timeToSolveS",
          "type": "u32"
        }
      ]
    },
    {
      "name": "createUser",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nickname",
          "type": "string"
        },
        {
          "name": "birthdate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "avatarHash",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "finishTask",
      "discriminator": [
        0,
        175,
        40,
        25,
        148,
        114,
        206,
        173
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "task",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "imgProofHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "initTaskCounter",
      "discriminator": [
        90,
        97,
        14,
        93,
        29,
        61,
        2,
        8
      ],
      "accounts": [
        {
          "name": "counter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  95,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "takeTask",
      "discriminator": [
        82,
        157,
        156,
        4,
        65,
        176,
        238,
        222
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "task",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "voteTask",
      "discriminator": [
        251,
        185,
        252,
        131,
        103,
        218,
        60,
        54
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "task",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "approve",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "task",
      "discriminator": [
        79,
        34,
        229,
        55,
        88,
        90,
        55,
        84
      ]
    },
    {
      "name": "tasksCounter",
      "discriminator": [
        4,
        4,
        99,
        66,
        210,
        234,
        222,
        234
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidData",
      "msg": "Check input data"
    },
    {
      "code": 6001,
      "name": "unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6002,
      "name": "canNotFinishTask",
      "msg": "Only task with status \\In progress\\ can be finished."
    },
    {
      "code": 6003,
      "name": "canNotVoteTask",
      "msg": "Only task with status \\Voting\\ can be voted."
    },
    {
      "code": 6004,
      "name": "canNotVoteTaskSecondTime",
      "msg": "You have already voted this task"
    },
    {
      "code": 6005,
      "name": "taskAlreadyVoted",
      "msg": "You have already voted this task."
    },
    {
      "code": 6006,
      "name": "taskAlreadyTaken",
      "msg": "Task already taken."
    },
    {
      "code": 6007,
      "name": "taskStale",
      "msg": "The task time has expired."
    },
    {
      "code": 6008,
      "name": "internalError",
      "msg": "TInternal program error."
    }
  ],
  "types": [
    {
      "name": "task",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "dueDateS",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "timeToSolveS",
            "type": "u32"
          },
          {
            "name": "userId",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "imgProofHash",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "taskStatus"
              }
            }
          },
          {
            "name": "approveVotes",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "disapproveVotes",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "taskStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "inProgress"
          },
          {
            "name": "voting"
          },
          {
            "name": "stale"
          },
          {
            "name": "success"
          },
          {
            "name": "fail"
          }
        ]
      }
    },
    {
      "name": "tasksCounter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "nickname",
            "type": "string"
          },
          {
            "name": "birthdate",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "avatarHash",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "registrationTime",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "taskCounterIdentifier",
      "type": "bytes",
      "value": "[116, 97, 115, 107, 95, 99, 111, 117, 110, 116, 101, 114]"
    },
    {
      "name": "taskIdentifier",
      "type": "bytes",
      "value": "[116, 97, 115, 107]"
    },
    {
      "name": "userIdentifier",
      "type": "bytes",
      "value": "[117, 115, 101, 114]"
    }
  ]
};
