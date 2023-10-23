export default class CollectionFilter {
    constructor(objects, params, model) {
        this.objects = objects;
        this.params = params;
        this.model = model;
    }
    get() {
        let objectsList = this.objects;
        let modelFields = [];
        for (let i = 0; i < this.model.fields.length; i++) {
            modelFields[i] = this.model.fields[i]["name"];
        }
        
        if(this.params != null) {
            let paramKeys = Object.keys(this.params);

            if (paramKeys.length != 0) {
                for (let i = 0; i < paramKeys.length; i++) {
                    if(modelFields.includes(paramKeys[i])) {
                        objectsList = objectsList.filter(obj => this.valueMatch(obj[paramKeys[i]],this.params[paramKeys[i]]));
                    } else if(paramKeys[i] == "sort") {
                        let sorting = this.params[paramKeys[i]];
                        
                        if (sorting.endsWith(",desc")) {
                            sorting = sorting.slice(0, -5);
                            objectsList.sort((a, b) => -(this.innerCompare(a[sorting], b[sorting])));
                        } else {
                            objectsList.sort((a, b) => this.innerCompare(a[sorting], b[sorting]));
                        }
                    } else if(paramKeys[i] == "limit") {
                        if(paramKeys[i+1] == "offset") {
                            try {
                                objectsList = objectsList.splice(this.params[paramKeys[i],this.params[paramKeys[i+1]]]);
                                i++;
                            } catch (error) {
                                //do nothing
                            }
                        }
                    } else if(paramKeys[i] == "field" ||
                            paramKeys[i] == "fields") {
                        let paramFields = this.params[paramKeys[i]].split(",");
                        let deleteParamList = [];
                        let newParamList = [];

                        modelFields.forEach(modelField => {
                            if(paramFields.includes(modelField)) {
                                newParamList.push(modelField);
                            } else {
                                deleteParamList.push(modelField);
                            }
                        });

                        if (deleteParamList.length != 0) {
                            objectsList.forEach(listedObject => {
                                deleteParamList.forEach(deleteParam => {
                                    delete listedObject[deleteParam];
                                });
                            });
                            
                            modelFields = newParamList;
                        }
                    }
                }
            }
        }
        

        return objectsList;
    }
    valueMatch(value, searchValue) {
        try {
            let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
            return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }
    innerCompare(x, y) {
        if ((typeof x) === 'string')
            return x.localeCompare(y);
        else
            return this.compareNum(x, y);
    }
}