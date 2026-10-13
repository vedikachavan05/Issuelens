def process_issue(issue):
    description=issue["description"].strip()

    if description=="":
        return {
        "sucess":False,
        "message":"Please Enter an issue"

        }
    else:

        return{
            "sucess":True,
            "message":"Issue received Sucessfully",
            "description":description

        } 

issue={"description":" Large PothHoles near the Bus Stop"}
issue2={"description":"      " }

result=process_issue(issue)
result=process_issue(issue2)
print(result)

