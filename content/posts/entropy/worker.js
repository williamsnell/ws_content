import {mutual_information, partial_mutual_information} from "./knn.js";

onmessage = (e) => {
    let mi_type = e.data[0];
    if (mi_type == "MI") {
        let result = mutual_information(e.data[1], e.data[2]);
        postMessage(result);
    } else if (mi_type == "PMI") {
        let result = partial_mutual_information(e.data[1], e.data[2], e.data[3], e.data[4]);
        postMessage(result);
    }
};
