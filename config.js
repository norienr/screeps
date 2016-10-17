var config = (function () {

    const ROLE_HARVESTER = 'harvester';
    const ROLE_UPGRADER = 'upgrader';
    const ROLE_BUILDER = 'builder';

    const MIN_HARVESTER_NUM = 2;
    const MIN_UPGRADER_NUM = 1;
    const MIN_BUILDER_NUM = 2;


    return {
        ROLE_HARVESTER: ROLE_HARVESTER,
        ROLE_UPGRADER: ROLE_UPGRADER,
        ROLE_BUILDER: ROLE_BUILDER,
        MIN_HARVESTER_NUM: MIN_HARVESTER_NUM,
        MIN_UPGRADER_NUM: MIN_UPGRADER_NUM,
        MIN_BUILDER_NUM: MIN_BUILDER_NUM
    };
})();

module.exports = config;