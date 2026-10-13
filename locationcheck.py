def process_issue(issue):
    description=issue["description"].strip()
    location=issue["location"].strip()

    if description=="" and location=="":
        return {
        "success":False,
        "message":"Please Enter the data correctly "

        }

    elif description=="":
        return {
            "success":False,
            "message":"please enter the description" 
        }
    elif location=="":
        return{
            "success":False,
            "message":"please enter the location"
        }


   
    else:

        return{
            "success":True,
            "message":"Issue received Sucessfully",
            "description":description,
            "location":location

   

        }

issue={"description":" Large PothHoles near the Bus Stop","location":"Canal Road Swargate,pune"}
issue2={"description":"Garbage Overflowing from Cans ","location":"    " }
issue3={"description":"   ","location":"   "}

result=process_issue(issue)
print(result)
result=process_issue(issue2)
print(result)
result=process_issue(issue3)
print(result)

