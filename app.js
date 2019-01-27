
//BUDGET MODULE
var budgetCtrl = (function()
{
    var Expense = function(id, description, value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    };
    
    Expense.prototype.calcPercentage = function(totalIncome)
    {
        if(totalIncome > 0)
        {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else
        {
            this.percentage = -1;
        }
        
    }

    Expense.prototype.getPercentage = function()
    {
        return this.percentage;
    }

    var Income = function(id, description, value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
        
    };

    var calculateTotal = function(type)
    {
        var sum = 0;
        data.allItems[type].forEach(function(current, index, array)
        {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = 
    {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        bugdet: 0,
        percentage: 0,
    };

    return {
        addItem: function(type, desc, value)
        {
           var newItem, ID;

           //..Create the new Id 
           //[1, 2, 4, 6, 8], next ID = last ID + 1 = 9
           if(data.allItems[type].length > 0)
           {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
           }
           else
           {
                ID = 0;
           }
           
           if(type === 'inc')
           {
                newItem = new Income(ID, desc, value);
           }
           else if(type === 'exp')
           {
                newItem= new Expense(ID, desc, value);
           }

           data.allItems[type].push(newItem);

           //..return the new item(expense or income)
           return newItem;
        },

        deleteItem: function(type, Id)
        {
            var ids_Array, index;

            //ids_Array = [1, 2, 4, 6, 8]
            ids_Array = data.allItems[type].map(function(currentItem)
            {
                return currentItem.id;
            });

            index = ids_Array.indexOf(Id); //index of item to delete

            if(index !== -1)
            {
                data.allItems[type].splice(index, 1);
            }
            
        },

        calculateBudget: function()
        {
            //..Calculate total income and total expense
            calculateTotal('exp');
            calculateTotal('inc');

            //..Calculate the budget: income - expenses
            data.bugdet = data.totals.inc - data.totals.exp;

            //..Calculate the percentage of income  that we spent
            if(data.totals.inc > 0)
            {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else
            {
                data.percentage = 0;
            }
           
        },

        calculatePercentages: function()
        {
            var totalIncome = data.totals.inc;
            data.allItems['exp'].forEach(function(currentItem)
            {
                currentItem.calcPercentage(totalIncome);
            });
        },

        getPercentages: function()
        {
            var allPercentages = data.allItems['exp'].map(function(currentItem)
            {
                return currentItem.getPercentage();
            });

            return allPercentages;
        },

        getBudget: function()
        {
            return {
                budget: data.bugdet,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },
    };    

})();


//UI CONTROLLER
var viewCtr = (function()
{
      var domStrings = 
      {
          inputType: '.add__type',
          inputDescription: '.add__description',
          inputAmount: '.add__value',
          inputBtn: '.add__btn',
          incomesContainer: '.income__list',
          expensesContainer: '.expenses__list',
          bugdetValue: '.budget__value',
          bugdetIncomes: '.budget__income--value',
          budgetExpenses: '.budget__expenses--value',
          budgetExpensesPercentage: '.budget__expenses--percentage',
          container: '.container',
          expensesPercentages: '.item__percentage',
          dateLabel: '.budget__title--month',
      };

      var formatNumber = function(num, type)
      {
            var numSplit, realPart, decimalPart;
            /*
            - or + before number for inc and exp respectively
            2 decimal points, comma separating the thousands

            2310.4567 -> 2,310.46
            
            */

            num = Math.abs(num);
            num = num.toFixed(2); //2 decimal points

            numSplit = num.split('.');

            realPart = numSplit[0];
            if(realPart.length > 3)
            {
                realPart = realPart.substr(0, realPart.length - 3) + ',' + realPart.substr(realPart.length - 3, 3); //23105 -> 23,105
            }
            decimalPart = numSplit[1]

            
            
            return (type === 'exp' ? '-' : '+') + ' ' + realPart + '.' + decimalPart;

      };


      return {
          getInputs: function()
          {
              return  {
                type : document.querySelector(domStrings.inputType).value,
                description : document.querySelector(domStrings.inputDescription).value,
                amount : parseFloat(document.querySelector(domStrings.inputAmount).value)
              };

          },

          addListItem: function(obj, type)
          {
              //..Create HTML string with placeholder text
              var html, newHtml, element;
              
              if(type === 'inc')
              {
                element = domStrings.incomesContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
              }
              
              else if(type === 'exp')
              {
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'  
              }

              //..replace the placeholder text with some actual data
              newHtml = html.replace('%id%', obj.id);
              newHtml = newHtml.replace('%description%', obj.description);
              newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

              //..insert the HTML into the DOM
              document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
          },

          deleteListItem: function(selectorId)
          {
              var domElement = document.getElementById(selectorId);
              domElement.parentNode.removeChild(domElement);
          },

          clearFields: function()
          {
              var fields, fieldsArr;

              fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputAmount);

              fieldsArr = Array.prototype.slice.call(fields);

              fieldsArr.forEach(function(currentElement, index, array) 
              {
                  currentElement.value = "";
              });

              fieldsArr[0].focus();
          },

          displayPercentages: function(percentages)
          {
                var fields = document.querySelectorAll(domStrings.expensesPercentages);

                 var nodeListForEach = function(list, callback)
                {
                    for(var i = 0; i < list.length; i++)
                    {
                        callback(list[i], i);
                    }
                };

                nodeListForEach(fields, function(current, index)
                {
                   
                    if(percentages[index] > 0)
                    {
                        current.textContent = percentages[index] + '%';
                    }
                    else
                    {
                        current.textContent = '---';
                    }
                    
                });
  
                /* OR
                fieldsArray = Array.prototype.slice.call(fields);
                
                fieldsArray.forEach(function(current, index, array)
                {
                    if(percentages[index] > 0)
                    {
                        current.textContent = percentages[index] + '%';
                    }
                    else
                    {
                        current.textContent = '---';
                    }

                });*/

            
 
          },

          displayMonth: function()
          {
                var now, month, year, months

                now = new Date();
                year = now.getFullYear();
                months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                
                month = months[now.getMonth()];
                

                document.querySelector(domStrings.dateLabel).textContent = month + ', ' + year;
                
          },

          getDomStrings: function()
          {
             return domStrings;
          },

          displayBudget: function(obj)
          {
              var type;
              obj.budget > 0 ? type = 'inc' : type = 'exp';

              document.querySelector(domStrings.bugdetValue).textContent = formatNumber(obj.budget, type) + '$';

              document.querySelector(domStrings.bugdetIncomes).textContent = formatNumber(obj.totalInc, 'inc') + '$';

              document.querySelector(domStrings.budgetExpenses).textContent = formatNumber(obj.totalExp,'exp') + '$';


              if(obj.percentage > 0)
              {
                document.querySelector(domStrings.budgetExpensesPercentage).textContent = obj.percentage + '%';
              }
              else
              {
                document.querySelector(domStrings.budgetExpensesPercentage).textContent = '--';
              }
          },
      }

})();

//CONTROLLER MODULE
var appCtr = (function(budgetCtrl, UICtrl)
{
      var setupEventListeners = function()
      {
            var DOM = UICtrl.getDomStrings();

            document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

            document.addEventListener('keypress', function(event)
            {
                if(event.keyCode === 13 || event.which === 13)
                {
                    ctrlAddItem();
                }
                
            });

            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      };

      var updateBudget = function()
      {
          
          //1. Calculate the budget
          budgetCtrl.calculateBudget();

          //2. Return the budget
          var budget = budgetCtrl.getBudget();

          //3. Display the bugdet on the UI  
          UICtrl.displayBudget(budget);
      };

      var updatePercentages = function()
      {
           //1. Calculate the percentages in the budget model
            budgetCtrl.calculatePercentages();

           //2..Read percentages from the budget model
           var percentages = budgetCtrl.getPercentages();

           //3.. Update the UI with new percentages
           UICtrl.displayPercentages(percentages);
      }

      var ctrlAddItem = function()
      {
         //1. Get the field input data
         var inputs = UICtrl.getInputs();
         
         if(inputs.description !== "" && !isNaN(inputs.amount) && inputs.amount > 0)
         {
            //2. Pass the data to the bugdet controller
            var newItem = budgetCtrl.addItem(inputs.type, inputs.description, inputs.amount);

            //3. Add the item to the UI and 
            UICtrl.addListItem(newItem, inputs.type);

            //4. clear the input fields
            UICtrl.clearFields();

            //5.. Calculate and update bugdet
            updateBudget();

            //6..Update the percentages
            updatePercentages();


         } 

      };

      var ctrlDeleteItem = function(event)
      {
            var itemId, splitId, type, Id;

            itemId = event.target.parentNode.parentNode.parentNode.id;

            if(itemId)
            {
                splitId = itemId.split('-');
                type = splitId[0];
                Id = parseInt(splitId[1]);

                //1.. Delete item from the data structure
                budgetCtrl.deleteItem(type, Id);

                //2.. Delete the item from the UI
                UICtrl.deleteListItem(itemId);

                //3.. Update and show new bugdet
                updateBudget();

                //4..Update the percentages
                updatePercentages();
            }
      };

      return {
          init: function()
          {
              console.log('Application has started');
              UICtrl.displayMonth();
              UICtrl.displayBudget(
              {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
              });
              setupEventListeners();
          }
      };
      
})(budgetCtrl, viewCtr);

appCtr.init();