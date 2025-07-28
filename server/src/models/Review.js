const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Review extends Model {
        static associate(models) {
            // Review เป็นของ User คนเดียว
            this.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
            // Review เป็นของ Book เล่มเดียว
            this.belongsTo(models.Book, {
                foreignKey: 'bookId',
                as: 'book',
            });
        }
    }

    Review.init(
        {
            rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 5,
                },
            },
            content: {
                type: DataTypes.TEXT,
            },
        },
        {
            sequelize,
            modelName: 'Review',
            timestamps: true,
        },
    );

    return Review;
};
