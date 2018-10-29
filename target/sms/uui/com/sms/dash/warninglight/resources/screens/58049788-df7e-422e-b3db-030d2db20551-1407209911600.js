jQuery("#simulation")
  .on("click", ".s-58049788-df7e-422e-b3db-030d2db20551 .click", function(event, data) {
    var jEvent, jFirer, cases;
    if(data === undefined) { data = event; }
    jEvent = jimEvent(event);
    jFirer = jEvent.getEventFirer();
    if(jFirer.is("#s-Category_1")) {
      cases = [
        {
          "blocks": [
            {
              "condition": {
                "action": "jimEquals",
                "parameter": [ {
                  "action": "jimGetSelection",
                  "parameter": {
                    "target": "#s-Category_1"
                  }
                },"山西分公司" ]
              },
              "actions": [
                {
                  "action": "jimNavigation",
                  "parameter": {
                    "target": "screens/3b032d7e-8594-4f37-88c5-23bc8a64b910"
                  }
                }
              ]
            }
          ]
        },
        {
          "blocks": [
            {
              "condition": {
                "action": "jimEquals",
                "parameter": [ {
                  "action": "jimGetSelection",
                  "parameter": {
                    "target": "#s-Category_1"
                  }
                },"四川分公司" ]
              },
              "actions": [
                {
                  "action": "jimNavigation",
                  "parameter": {
                    "target": "screens/79f2e492-67eb-4e6b-9769-1d612c435860"
                  }
                }
              ]
            }
          ]
        }
      ];
      event.data = data;
      jEvent.launchCases(cases);
    }
  });