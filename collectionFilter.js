export default class CollectionFilter {
    constructor(objects, params, model) {
        this.objects = objects;
        this.params = params;
        this.model = model;
    }
    get() {
        let objectsList = this.objects;
        let objectKeys = Object.keys(objectsList);
        let paramKeys = Object.keys(this.params);

        if (paramKeys.length != 0) {
            for (let i = 0; i < paramKeys.length; i++) {
                if(objectKeys.includes(paramKeys[i])) {
                    objectsList = objectsList.filter(obj => this.valueMatch(obj[paramKeys[i]],this.params[paramKeys[i]]));
                } else if(paramKeys[i] == "sort") {
                    let sorting = this.params[paramKeys[i]];
                    
                    if (sorting.endsWith(",desc")) {
                        sorting = sorting.slice(0, -5);
                        objectsList.sort((a, b) => !this.innerCompare(a[sorting], b[sorting]));
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
                    let fields = this.params[paramKeys[i]].split(",");

                    for (let j = 0; j < objectKeys.length; j++) {
                        if(!fields.contains(objectKeys[j])) {
                            delete objectKeys[objectKeys[j]];
                        }
                    }
                    objectKeys = Object.keys(objectsList);
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