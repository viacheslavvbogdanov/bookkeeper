const {getNetworkOrForkName} = require('../deploy-tools/deploy-tools')
// const fetch = require('node-fetch');

module.exports = async ({getNamedAccounts, deployments, network}) => {

    console.log('+ Updating Contract Registry ');
    async function getSwapAddress(swapName) {
        const contract = await deployments.get(swapName);
        return contract.address;
    }

    const poolsUrl  = 'https://ethparser-api.herokuapp.com/contracts/pools?network='
    const vaultsUrl = 'https://ethparser-api.herokuapp.com/contracts/vaults?network='

   /* async function downloadAddresses(url) {
        const response = await fetch(url)
        const json = await response.json();
        const a = [];
        json.data.forEach(i => a.push(i.contract.address));
        console.log(a.length, 'addresses downloaded from', url);
        const arr =  JSON.stringify(a, null,' ');
        console.log('arr', arr);
        return a;
    }*/

    let apiPools, apiVaults, net;

    const fork = getNetworkOrForkName(network);
    switch (fork) {
        case '':  // for testing with no fork (hardhat network)
        case 'mainnet':
            net = 'eth'
            // apiPools  = await downloadAddresses(poolsUrl +net);
            // apiVaults = await downloadAddresses(vaultsUrl+net);
            apiPools  = [
                "0xb5f7fd6fc1a0f0b606d6f65f656af79e12c310b7",
                "0x11301b7c82cd953734440aaf0d5dd0b36e2ab1d8",
                "0x95d2e18c069175523f56b617f96be7575e381547",
                "0x1997e59399bad38068b07d20d64bbdbc6882501b",
                "0x34d358cd25e4bbdcf7d30887c55fe68e0f25dc65",
                "0xaa6f97dfe0ba937e311d216972707fd886886e75",
                "0xdc1873c8e58e925d530b94ff14b0aa4121b04d1f",
                "0x277c218336e0935b5e5cbde90b96da59ce34b2e4",
                "0x5aab6c393c641b1ab1f32e61f9a81640008c22b0",
                "0xa7336377c882f511b1dbfb4c8649117edf593cab",
                "0x2bd2ba6cca8a9e1ffbcdfe9a3ccf7fb7d4f83ec4",
                "0xd127474b8f38561819a6cb3e38572a99050c1128",
                "0x611ac252ed4bf54b7980ff64bc94058f5dcb5bb2",
                "0xfbfbe380489882831dad5258cfd2e29307e23b82",
                "0xf435e8e3d48c972ef536b4862b2cfec4d0a8c5f1",
                "0x31a69b3d430a08c711faca9c2c0b4a50f593626b",
                "0xba20df1c78ed7ce835035e49dc0389ff11224a76",
                "0xf8cbfe8817d7a7986b6f1c67e29262b8d2496102",
                "0xc02f8fe55aa542038a619e17ed42002eb7a5d247",
                "0x2579687f556c963b607a8e44c1fba0f363d2aa11",
                "0xa9e60dd0ef825a1009b37edb75b312bda5ad1a51",
                "0xd2d19439e84fcbaa7d4c755b3e15b1cb67cea17b",
                "0xae8d48de831a64787ddc3ac67fd93fd10b008606",
                "0x8ab3342a692935a8ad23214d7403403d224d2ba4",
                "0x174678b2632910e97bfdf284fa0583ba717b980f",
                "0xd18f256b380b30d7aa24c504b39f7320df1b2dbe",
                "0x47f4fc5706a10a605b41b7f791740086323d21cc",
                "0x17ea335b82844212468000e7aeb5f55d63948c47",
                "0x5ed17ca557359eab39fea1de8240bac4b9c7beca",
                "0x85f11e0480cc8f0a1c9b24b6421fadd9c10b485f",
                "0xab2e513c9f92a7b0f36f7feef680cd0f502b23dc",
                "0x6dc8be78e95480e5566138429089d4ca589f5a34",
                "0x8e54bb5e1411be9c776b17b0cd267f2955377e32",
                "0x079158beca3c0ee6ae44b43357c6317e339ddc69",
                "0x269fa8c40062692cfd5494e5ec7dad64745b45af",
                "0x9b36b44c6e3bfb1adfbe31bb7b8c4f9af7a804ee",
                "0xe7e1c3624188052a2367b63048a32a7429980113",
                "0xd8a3c7d1deccb8445a4391f6052e5a0726f2f270",
                "0x516658d83a68747c34fd5aecba7068ad4bd4783d",
                "0x14ac1bddd9160866590c6c4ec16853a1510845b9",
                "0xc5fc56779b5925218d2cdac093d0bfc6de7cc2d1",
                "0x3b808a7d8ccdf8893d1360ff421bef4440376842",
                "0x743bd82331cae227fa2c8c97f345a6846f8383b1",
                "0x15aeb9b209fec67c672dbf5113827dab0b80f390",
                "0x08aa65118996eaa61372b65978cfa684f2c749b2",
                "0xf5833723b150929d1fddf785ed9d92eee722387d",
                "0x378c314028071c92efe15d6990b6cf93594fcb9d",
                "0x0c67fba277a3fe1b0a792ef5bc798cbbda15a7f5",
                "0x695a1c24f1de5e3fa7012496163ad0adba3f5a3c",
                "0x06c54763514a167db92ba2684ac2ea0142df90fc",
                "0x9c6fbdbf59808cd920fdb166c25e2e9fcf708dd1",
                "0xf550804ebd6f89cdc9ec8e92ce8de91a2f64a82e",
                "0x59eeb34065db1621c68d26f37ffeff3a89e5fa8b",
                "0x677ad66025063be55b070685e618a84ff3dd62be",
                "0x937d4b84f139bec548b825fdce33b172c5bf755a",
                "0x719d70457658358f2e785b38307cfe24071b7417",
                "0xdd496a6ba1b4cf2b3ef42def132e2b2c570941fe",
                "0x59a87ab7407371b933cad65001400342519a79bb",
                "0xf4ead5142749316c8ca141959b510862fbba1807",
                "0x16b5089ed717409849b2748ac73adfbfe7ec0301",
                "0x10f1fc85eaa1f064e38eeffda82fba414841f438",
                "0x16fbb193f99827c92a4cc22efe8ed7390465bfa3",
                "0x12e75bb878b26a1cbfc0c1704654aa1423b07f5a",
                "0x538613a19eb84d86a4ccfcb63548244a52ab0b68",
                "0x2e25800957742c52b4d69b65f9c67abc5ccbffe6",
                "0xc02d1da469d68adc651dd135d1a7f6b42f4d1a57",
                "0x40c34b0e1bb6984810e17474c6b0bcc6a6b46614",
                "0xfe83a00df3a98de218c08719faf7e3741b220d0d",
                "0x8dc427cbcc75cae58dd4f386979eba6662f5c158",
                "0x056e01b3566f10b98f5130c819de34ee535b4924",
                "0xddb5d3ccd968df64ce48b577776bdc29ebd3120e",
                "0xf4d50f60d53a230abc8268c6697972cb255cd940",
                "0x3483ad82d405b9ab480ec061dae3c62dbe538cba",
                "0x3a0f8be248402a85b1557d434074b84e640f3793",
                "0x63e7d3f6e208cce4967b7a0e6a50a397af0b0e7a",
                "0xf5b221e1d9c3a094fb6847bc3e241152772bbbf8",
                "0x08c795e57ff0c2695ea8733cf04ab75af3909e5a",
                "0xb2b4054f50d5feba40af7759f4619f6b68a95520",
                "0x7c497298d9576499e17f9564ce4e13faa87a9b33",
                "0xdb9c2eba87301e6951d6fbe7a458832eaab2137e",
                "0x3cdde34c96ecb95a1232c9673e23f2db5fa72280",
                "0x747318cf3171d4e2a1a52bbd3fcc9f9c690448b4",
                "0x2a80e0b572e7ef61ef81ef05ec024e1e52bd70bd",
                "0x9a9a6148f7b0a9767ac1fdc67343d1e3e219fddf",
                "0xda5e9706274d88bbf1bd1877a9b462fc40cdcfad",
                "0x91b5cd52fde8dbac37c95ecafef0a70ba4c182fc",
                "0xf330891f02f8182d7d4e1a962ed0f3086d626020",
                "0xf4784d07136b5b10c6223134e8b36e1dc190725b",
                "0x98ba5e432933e2d536e24a2c021debb8404588c1",
                "0x797f1171dc5001b7a79ff7dca68c9539329cce48",
                "0xf3b2b174e7f36e43246ef33fc58ce5821f21f799",
                "0x6555c79a8829b793f332f1535b0efb1fe4c11958",
                "0xe58f0d2956628921cded2ea6b195fc821c3a2b16",
                "0x72c50e6fd8cc5506e166c273b6e814342aa0a3c1",
                "0x01f9caad0f9255b0c0aa2fbd1c1aa06ad8af7254",
                "0xad91695b4bec2798829ac7a4797e226c78f22abd",
                "0xa56522bca0a09f57b85c52c0cc8ba1b5edbc64ef",
                "0x6b4e1e0656dd38f36c318b077134487b9b0cf7a6",
                "0xe2d9fae95f1e68afca7907dfb36143781f917194",
                "0x76aef359a33c02338902aca543f37de4b01ba1fa",
                "0x093c2ae5e6f3d2a897459aa24551289d462449ad",
                "0xef4da1ce3f487da2ed0be23173f76274e0d47579",
                "0xc0f51a979e762202e9bef0f62b07f600d0697de1",
                "0x017ec1772a45d2cf68c429a820ef374f0662c57c",
                "0x27f12d1a08454402175b9f0b53769783578be7d9",
                "0x6d1b6ea108aa03c6993d8010690264ba96d349a8",
                "0xa3cf8d1cee996253fad1f8e3d68bdcba7b3a3db5",
                "0x7b8ff8884590f44e10ea8105730fe637ce0cb4f6",
                "0x6ac4a7ab91e6fd098e13b7d347c6d4d1494994a2",
                "0x4f7c28ccb0f1dbd1388209c67eec234273c878bd",
                "0x15d3a64b2d5ab9e152f16593cdebc4bb165b5b4a",
                "0x3da9d911301f8144bdf5c3c67886e5373dcdff8e",
                "0x917d6480ec60cbddd6cbd0c8ea317bcc709ea77b",
                "0xb036b53164de8423e150c1805c0f6c43aba453e5",
                "0x9523fdc055f503f73ff40d7f66850f409d80ef34",
                "0xf1181a71cc331958ae2ca2aad0784acfc436cb93",
                "0x7aeb36e22e60397098c2a5c51f0a5fb06e7b859c",
                "0x156733b89ac5c704f3217fee2949a9d4a73764b5",
                "0x75071f2653fbc902ebaff908d4c68712a5d1c960",
                "0xc47ef3da5f58e1df533bb074ac27928c65d18721",
                "0xae160ae334be46d22c9906b1e2042cec410268c5",
                "0xec56a21cf0d7feb93c25587c12bffe094aa0ecda",
                "0xf50be726417755074777da8d8da56f1638bf7ce4",
                "0x8f5adc58b32d4e5ca02eac0e293d35855999436c",
                "0x3bdc3e2572a5540bb1eb1e55bb8749d33fd1a105",
                "0xdc27244311c56ed038e7acf104245ec6a040d07f",
                "0xc24da7a6b5adc8771588d58b6109ef52c95a311e",
                "0x9494a3026f28d0b189252428cebbfa52e69608c4",
                "0x8bcbf139b8d7b26f37d89f2c8aa9de810b5a3814",
                "0x82bdac405762482f9411a7d970841ce55f64e04b",
                "0x489c78aa0969118439176c14af22b3b56bd1d46e",
                "0xbdbfa2b08fc2a4e53df841fb2e2ae45f10d3f054",
                "0x298a92daf7c71ced261c79300a620e8bee54daa6",
                "0xbb846ad2552c0669062c9eadfa63148bcba3e2b0",
                "0xe11c81b924bb91b44bae19793539054b48158a9d",
                "0xcdac55c36f3188e42d8491f8c59a6c372764b894",
                "0x346523a81f16030110e6c858ee0e11f156840bd1",
                "0x45a760b3e83ff8c107c4df955b1483de0982f393",
                "0x19f8ce19c9730a1d0db5149e65e48c2f0daa9919",
                "0xb492faeda6c9ffb9b9854a58f28d5333ff7a11bc",
                "0x43286f57cf5981a5db56828df91a46cfab983e58",
                "0x316de40f36da4c54aff11c1d83081555cca41270",
                "0x2f97d9f870a773186cb01742ff298777bbf6f244",
                "0xb4d1d6150dac0d1a994afb2a196adadbe639ff95",
                "0xb0c22da17d32c01861972bc7c55b650c2d533800",
                "0x26582bea67b30af166b7fcd3424ba1e0638ab136",
                "0x158edb94d0bfc093952fb3009deeed613042907c",
                "0x7af4458d3abd61c3fd187bb9f1bbf917cd4be9b8",
                "0xf465573288d9d89c6e89b1bc3bc9ce2b997e77df",
                "0x44356324864a30216e89193bc8b0f6309227d690",
                "0xc5ddd0986caeb7fb7fc1556712af141e9e6a83ca",
                "0x5365a2c47b90ee8c9317fac20edc3ce7037384fb",
                "0xcfe1103863f9e7cf3452ca8932eef44d314bf9c5",
                "0x6291ece696cb6682a9bb1d42fca4160771b1d7cc",
                "0x905cf5217002f1031425549d398c66adf72ec4f2",
                "0x77ee32430ca49f99b590782f5ff83405272f0676",
                "0x74fad021134e5851896fa58f536981c6eb4da5e6",
                "0x9a63d269b17e18dad592b219fea3d06201f5f946",
                "0x876433f4c4a190b7dbd4b8db750448841d43a4c3",
                "0x78c3e52db6abee5cbd353a429e4c88b23e36b089",
                "0xd8f5a5bea95740d2749d20f4c26d543579a7b6d8",
                "0xe72d38d0a72aaa1e1fd98d59bfc959f871e99b6f",
                "0x99b0d6641a63ce173e6eb063b3d3aed9a35cf9bf",
                "0x6f8a975758436a5ec38d2f9d2336504430465517",
                "0xc6f39cff6797bac5e29275177b6e8e315cf87d95",
                "0xb3b56c7bdc87f9deb7972cd8b5c09329ce421f89",
                "0xf71042c88458ff1702c3870f62f4c764712cc9f0",
                "0x3631a32c959c5c52bc90ab5b7d212a8d00321918",
                "0xc97ddaa8091abaf79a4910b094830cce5cdd78f4",
                "0x4938960c507a4d7094c53a8cddcf925835393b8f",
                "0x84646f736795a8bc22ab34e05c8982cd058328c7",
                "0xa112c2354d27c2fb3370cc5d027b28987117a268",
                "0xe604fd5b1317babd0cf2c72f7f5f2ad8c00adbe1",
                "0x5bd997039fff16f653ef15d1428f2c791519f58d",
                "0xe1f9a3ee001a2ecc906e8de637dbf20bb2d44633",
                "0xf9e5f9024c2f3f2908a1d0e7272861a767c9484b",
                "0xae024f29c26d6f71ec71658b1980189956b0546d"
            ]
            apiVaults = [
                "0x7674622c63bee7f46e86a4a5a18976693d54441b",
                "0xe438c0fffba2a81094b6623e5191866d32814c22",
                "0x7ddc3fff0612e75ea5ddc0d6bd4e268f70362cff",
                "0xb19ebfb37a936cce783142955d39ca70aa29d43c",
                "0x307e2752e8b8a9c29005001be66b1c012ca9cdb7",
                "0x1a9f22b4c385f78650e7874d64e442839dc32327",
                "0x01112a60f427205dca6e229425306923c3cc2073",
                "0xb1feb6ab4ef7d0f41363da33868e85eb0f3a57ee",
                "0xf553e1f826f42716cdfe02bde5ee76b2a52fc7eb",
                "0x9aa8f427a17d6b0d91b6262989edc7d45d6aedf8",
                "0x192e9d29d43db385063799bc239e772c3b6888f3",
                "0x71b9ec42bb3cb40f017d8ad8011be8e384a95fa5",
                "0xb677bca369f2523f62862f88d83471d892dd55b9",
                "0x5c0a3f55aac52aa320ff5f280e77517cbaf85524",
                "0x29ec64560ab14d3166222bf07c3f29c4916e0027",
                "0x84bae33581a5d35d636a36b983b22f3ca3bb06af",
                "0x203e97aa6eb65a1a02d9e80083414058303f241e",
                "0xa79a083fdd87f73c2f983c5551ec974685d6bb36",
                "0x63671425ef4d25ec2b12c7d05de855c143f16e3b",
                "0x4d4b6f8efb685b774234fd427201b3a9bf36ffc8",
                "0x64035b583c8c694627a199243e863bb33be60745",
                "0x640704d106e79e105fda424f05467f005418f1b5",
                "0x13027a850db05f9397d89664640d7dbd919179f6",
                "0x683e683fbe6cf9b635539712c999f3b3edcb8664",
                "0xcc775989e76ab386e9253df5b0c0b473e22102e2",
                "0x6f14165c6d529ea3bfe1814d0998449e9c8d157d",
                "0x8bf3c1c7b1961764ecb19b4fc4491150ceb1abb1",
                "0xf8b7235fcfd5a75cfdcc0d7bc813817f3dd17858",
                "0x2a32dcbb121d48c106f6d94cf2b4714c0b4dfe48",
                "0x145f39b3c6e6a885aa6a8fade4ca69d64bab69c8",
                "0x45a9e027ddd8486fad6fca647bb132ad03303ec2",
                "0xd162395c21357b126c5afed6921bc8b13e48d690",
                "0x633c4861a4e9522353eda0bb652878b079fb75fd",
                "0x7e3c4230e047349a6bd5b154194115acd5b8ef83",
                "0x7ac7cd6776208d316861f46eb99dcaf5faece3f0",
                "0x639d4f3f41daa5f4b94d63c2a5f3e18139ba9e54",
                "0x21e22315bcfcba1c02fc40903bf02b3bd78c6e13",
                "0x8e53031462e930827a8d482e7d80603b1f86e32d",
                "0xaf255ec184cc3fd6f7bb221b6a15f91289807a22",
                "0x4bf633a09bd593f6fb047db3b4c25ef5b9c5b99e",
                "0x859222dd0b249d0ea960f5102dab79b294d6874a",
                "0xe6bf65e5a94bf8b3b3e0045bbaf9c1cb24368427",
                "0xc800982d906671637e23e031e907d2e3487291bc",
                "0x11804d69acac6ae9466798325fa7de023f63ab53",
                "0x8334a61012a779169725fcc43adcff1f581350b7",
                "0x07dbe6aa35ef70dad124f4e2b748ffa6c9e1963a",
                "0xc3ef8c4043d7cf1d15b6bb4cd307c844e0ba9d42",
                "0x5ade382f38a09a1f8759d06ffe2067992ab5c78e",
                "0x84a1dfadd698886a614fd70407936816183c0a02",
                "0x5c5f87cabdeb5c57192174ef11b2ce6625f0c7a5",
                "0xc27bfe32e0a934a12681c1b35acf0dba0e7460ba",
                "0xb4e3fc276532f27bd0f738928ce083a3b064ba61",
                "0xa860a99ba32f1768a4b46d898beae303637f0bc7",
                "0xfca949e34ecd9de519542cf02054de707cf361ce",
                "0x4d4d85c6a1ffe6bb7a1bef51c9e2282893fee521",
                "0x5cd9db40639013a08d797a839c9becd6ec5dcd4d",
                "0x8a0f6b8a53556bdceddb5c710bb8f27f4bea33e7",
                "0x24c562e24a4b5d905f16f2391e07213efcfd216e",
                "0xaf9486e3da0ce8d125af9b256b3ecd104a3031b9",
                "0x1e5f4e7127ea3981551d2bf97dcc8f17a4ecebef",
                "0xf2a671645d0df54d2f03e9ad7916c8f7368d1c29",
                "0xb37c79f954e3e1a4accc14a5cca3e46f226038b7",
                "0xc45d471c77ff31c39474d68a5080fe1ffacdbc04",
                "0xddb4669f39c03a6eda92ffb5b78a9c1a74615f1b",
                "0xf174dddd9dbffeaea5d908a77d695a77e53025b3",
                "0x274aa8b58e8c57c4e347c8768ed853eb6d375b48",
                "0x5ea74c6abf0e523fdecfe218ccb3d2fde2339613",
                "0xe6e0b4294ef6a518bb702402e9842df2a2abf1b1",
                "0x227a46266329767cea8883bfc81d21f1ea0edbb3",
                "0x26193024f481aa987fc5230e107f1651b3e01741",
                "0x230d3e848d04516826067acb08fa6c5a552d3e62",
                "0x371e78676cd8547ef969f89d2ee8fa689c50f86b",
                "0xb89777534acccc9ae7cba0e72163f9f214189263",
                "0x0ca19915439c12b16c0a8c119ec05fa801365a15",
                "0xd3093e3efbe00f010e8f5efe3f1cb5d9b7fe0eb1",
                "0xb8671e33fcfc7fea2f7a3ea4a117f065ec4b009e",
                "0x380d1862488e7096a9f16d4f7145c0d9a9e47085",
                "0x0fe4283e0216f94f5f9750a7a11ac54d3c9c38f3",
                "0xf2b223eb3d2b382ead8d85f3c1b7ef87c1d35f3a",
                "0x998ceb152a42a3eac1f555b1e911642bebf00fad",
                "0x4b1cbd6f6d8676ace5e412c78b7a59b4a1bbb68a",
                "0x29780c39164ebbd62e9ddde50c151810070140f2",
                "0x6bccd7e983e438a56ba2844883a664da87e4c43b",
                "0x8d2450c6e35c765fa4d43fc9eea87be269e1ab5b",
                "0xc7ee21406bb581e741fbb8b21f213188433d9f2f",
                "0x053c80ea73dc6941f518a68e2fc52ac45bde7c9c",
                "0xc8404f55015fc76ea36ca11dc8628dd38f1d6ed2",
                "0x02d77f6925f4ef89ee2c35eb3dd5793f5695356f",
                "0x966a70a4d3719a6de6a94236532a0167d5246c72",
                "0x5833e0b0ddd01e2a70e18cf6c6288ca8802a42e8",
                "0x4282b7b7d3d8826a058028ee0279c3f830481191",
                "0xab7fa2b2985bccfc13c6d86b1d5a17486ab1e04c",
                "0xe85c8581e60d7cd32bbfd86303d2a4fa6a951dac",
                "0xc07eb91961662d275e2d285bdc21885a4db136b0",
                "0x5d9d25c7c457dd82fc8668ffc6b9746b674d4ecb",
                "0x8255fe84f769ba086dcab2db14f20dfaf79bc5ee",
                "0x12db4a4c442944a10ed153db64c500beb006039f",
                "0x6eb941bd065b8a5bd699c5405a928c1f561e2e5a",
                "0x3860bd4f060c2f4b44596b537507ffee9459b3f5",
                "0xa10a749a5a2a2d3f0c0317a92c3e9159df567e34",
                "0xfe09e53a81fe2808bc493ea64319109b5baa573e",
                "0x8e298734681adbfc41ee5d17ff8b0d6d803e7098",
                "0x14e7a00109d95c6340799a108133f4427161d865",
                "0x33ed34dd7c40ef807356316b484d595ddda832ab",
                "0xd91b06ce5a57d271f605bd58d31184b670032145",
                "0xcf16b17a215d1728b0a36a30a57beaaf7845f334",
                "0xc391d1b08c1403313b0c28d47202dfda015633c4",
                "0xfbe122d0ba3c75e1f7c80bd27613c9f35b81feec",
                "0x9af516e9095069972528eeba8e55275e31fe7734",
                "0x99c2564c9d4767c13e13f38ab073d4758af396ae",
                "0x5774260ccd87f4fffc4456260857207fc8bcb89a",
                "0x01bd09a1124960d9be04b638b142df9df942b04a",
                "0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe",
                "0xc3f7ffb5d5869b3ade9448d094d81b0521e8326f",
                "0x25550cccbd68533fa04bfd3e3ac4d09f9e00fc50",
                "0x59258f4e15a5fc74a7284055a8094f58108dbd4f"
            ]
            break

        case 'bsc':
            net = 'bsc'
            // apiPools  = await downloadAddresses(poolsUrl +net);
            // apiVaults = await downloadAddresses(vaultsUrl+net);
            apiPools  = [
                "0x884843ca341e00b42045110a02d85f3406604449",
                "0x7002fc2d41d4185787f7b019c2517bb8490b9368",
                "0xe5f7396b7f7d52c024be5e8fe229b8e11eefccc1",
                "0x9481251436c1e27e5dba5462c763491b8ee441cd",
                "0x1bb6fdaf6258071f4d2e96d70ffeb8ad392f299b",
                "0xfe7f456f8274355f17243b7282bd88129e894b1a",
                "0x4165884840ee7e6280c512c75b23b098f7e420fc",
                "0x9b36e1dcbb21dfa6863b2711ed6f0f080888072c",
                "0x8e8ca3719360809cd4bfe175de58992e7d3e7874",
                "0x5c6fe09fcefeaca84dc18018cf8acf7476b2498f",
                "0x03292bdfe36591f70575c77847d7f004ffd0966a",
                "0xc2a1fa5753b7c3272f32abec19140658d539e61c",
                "0xea2c3c25985fbb5418c61451c2cbd1311e0ebe9e",
                "0x0694e3cb1055ff33d774d51a55272ddee305f745",
                "0x2fee56e039acccefa3cb1f3051ad00fe550a472c",
                "0x76aaddf1ebaf9300dad18469d01a0ee62633abe7",
                "0xe637e7d1e37875c787b773dbeb28fcc55fe91c16",
                "0x08b6732e1d07726e8f398a0ea97200d26e172066",
                "0xf53c6789f35c4ecf152d2168ca203808595cb524",
                "0xd16a735656f0a310e6ea8f502cf1d6307803d76a",
                "0x57c30567e0dbd1c308fd2c5665c4084f368560a2",
                "0xe9e03506a088eacdfa1a690cd3019ac105d7b871",
                "0x9178f402453b118b6b897ff520256ed63b2d9998",
                "0x03b58ce34e9cb6a908b019228778cbb9f3a1a2ba",
                "0xdeb314a2222884b6c1e848bffcf68dcfbc5c1406",
                "0xfc8c1f0e25d91cb10db243acbca5ac3c422a6277",
                "0x7caa01b3dc8ee91aa6fa7093e184f045e0da8792",
                "0x26a4fe4c858f0d8a11442d358d182f2832a7f84c",
                "0x063eb32430bd63f4144f3e87d3339e4d2a318c52",
                "0xf1121f56961c6dfd40355dde61404d51b3f1c34e",
                "0x221ed06024ee4296fb544a44cfeddf7c9f882cf3",
                "0xd4bc6001937c6ff493e4bae3ba0f812799f86ab0",
                "0x78963b538c4835e00648df764029196700ea8ee9",
                "0xeab819e2be63ffc0df64e7bba4ddb3bdea280310",
                "0xe83f395b076f9b95200f9bec40f5e446599f4f06",
                "0xda88e38735e75b58fee6ea4fc5be576c1e22f6cd",
                "0x8709b440c0f4f6830a468c6f696d010e85c9510b",
                "0x3331039530dd04b5df06c2d226ac28e958bacc0f",
                "0xc6f39cff6797bac5e29275177b6e8e315cf87d95",
                "0xb3b56c7bdc87f9deb7972cd8b5c09329ce421f89"
            ];
            apiVaults = [
                "0xcf5f83f8fe0ab0f9e9c1db07e6606dd598b2bbf5",
                "0x84646f736795a8bc22ab34e05c8982cd058328c7",
                "0x0bb94083d5718a8cb716fadc016187a0d6c99425",
                "0xe1f9a3ee001a2ecc906e8de637dbf20bb2d44633",
                "0xffbd102fafbd9e15c9122d9c62ab299afd4d3e4f",
                "0x6d386490e2367fc31b4acc99ab7c7d4d998a3121",
                "0x33da6b1a05b4afcc5a321aacaa1334bda4345a14",
                "0x374787234b369b56b3701e0b932051b37726096a",
                "0xe604fd5b1317babd0cf2c72f7f5f2ad8c00adbe1",
                "0xad941e12544f49077fc6425cda1871e11cea5288",
                "0xbf2989575de9850f0a4b534740a88f5d2b460a4f",
                "0xe3f309f151746b3c0953e4c0e455bff3dc2176aa",
                "0x9090bccd472b9d11de302572167ded6632e185ab",
                "0xc97ddaa8091abaf79a4910b094830cce5cdd78f4",
                "0x0392f36d2896c966e141c8fd9eca58a7ca9fa8af",
                "0x1bfb4ed996f4356aa705891dedb7d7776402bec1",
                "0xcd8fb1302c30fde56bce5b34211e84561bbf0df1",
                "0x394e653bbfc9a3497a0487abee153ca6498f053d",
                "0xc3f7ffb5d5869b3ade9448d094d81b0521e8326f",
                "0xd75ffa16ffbcf4078d55ff246cfba79bb8ce3f63",
                "0xf7a3a95d0f7e8a5eeae483cdd7b76af287283d34",
                "0x78cf4a86ba3b4c5246d097e5cd0833cb641c1425",
                "0x21fa8c490e7c1a0d3f1c82e63a5d2ee276614c60",
                "0x5089ea6c884a03823672888b57ebce929ece63ca",
                "0x2ce34b1bb247f242f1d2a33811e01138968efbff",
                "0x63671425ef4d25ec2b12c7d05de855c143f16e3b",
                "0x0a7d74604b39229d444855ef294f287099774ac8",
                "0x75071f2653fbc902ebaff908d4c68712a5d1c960",
                "0x129ccee12a9542ff77e066e6f8d7df49f8cbf89d",
                "0x5da237ad194b8bbb008ac8916df99a92a8a7c8eb",
                "0x299b00d031ba65ca3a22a8f7e8059dab0b072247",
                "0xb75f4c87ebed0a2c6e3d6ff62844e3663cf83bb8",
                "0x1c4adff419f6b91e51d0ade953c9bbf5d16a583f",
                "0x2427da81376a0c0a0c654089a951887242d67c92",
                "0xe64bfe13aa99335487f1f42a56cddbffaec83bbf",
                "0x14cb410659b4a4a7ccea99e6f6c9eac8718160df",
                "0x6a0d7383762962be039c197462bf1df377410853",
                "0xf553e1f826f42716cdfe02bde5ee76b2a52fc7eb",
                "0x3d5b0a8cd80e2a87953525fc136c33112e4b885a",
                "0x1274b70bf34e1a57e78c2a2f3e28a4e1b66cbe48",
                "0xfeb902db08e4e1f362866628098d6110dbe3d072",
                "0x59258f4e15a5fc74a7284055a8094f58108dbd4f"
            ];
            break

        case 'matic':
            apiPools  = [
                '0x284D7200a0Dabb05ee6De698da10d00df164f61d', // quick_IFARM_QUICK
                '0xE1f9A3EE001a2EcC906E8de637DBf20BB2d44633', // quick_ETH_USDT
                '0xB25e2C1efDD4b79CD5d63C0F5a45326FA4CA2139', // sushi_USDC_ETH
            ]
            apiVaults = [
                '0x388Aaf7a534E96Ea97beCAb9Ff0914BB10EC18fE', // quick_IFARM_QUICK
                '0x3D5B0a8CD80e2A87953525fC136c33112E4b885a', // quick_ETH_USDT
                '0xf76a0C5083b895c76ecBF30121F036849137D545', // sushi_USDC_ETH
            ]
            break

        default:
            console.log('- ERROR: UNKNOWN NETWORK / FORK:', fork);
            return
    }

    const {execute} = deployments;
    const {deployer} = await getNamedAccounts();
    const contractName = 'ContractRegistry';
    const options = {from: deployer}

    await execute(contractName, options, 'addPoolsArray',  apiPools);
    console.log('addPoolsArray - executed');

    await execute(contractName, options, 'addVaultsArray', apiVaults);
    console.log('addVaultsArray - executed');

};
module.exports.tags = ['RegistryUpdate'];
module.exports.dependencies = ['Registry'];
